use std::fs;
use std::path::Path;
use notify::{Watcher, RecursiveMode, Event};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileSystemNode {
    id: String,
    name: String,
    path: String,
    #[serde(rename = "type")]
    node_type: String,
    size: Option<u64>,
    modified: Option<DateTime<Utc>>,
    created: Option<DateTime<Utc>>,
    extension: Option<String>,
    children: Option<Vec<FileSystemNode>>,
    expanded: Option<bool>,
    is_virtual: Option<bool>,
    content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileSearchOptions {
    query: String,
    path: Option<String>,
    include_hidden: Option<bool>,
    case_sensitive: Option<bool>,
    use_regex: Option<bool>,
    max_depth: Option<usize>,
    file_extensions: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileWatchEvent {
    #[serde(rename = "type")]
    event_type: String,
    path: String,
    old_path: Option<String>,
    timestamp: DateTime<Utc>,
}

// Global watcher storage
lazy_static::lazy_static! {
    static ref WATCHERS: Arc<Mutex<HashMap<String, notify::RecommendedWatcher>>> = Arc::new(Mutex::new(HashMap::new()));
}

#[tauri::command]
pub async fn read_directory(path: String) -> Result<Vec<FileSystemNode>, String> {
    let dir_path = Path::new(&path);
    
    if !dir_path.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }
    
    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }
    
    let mut nodes = Vec::new();
    
    match fs::read_dir(dir_path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(metadata) = entry.metadata() {
                        let file_path = entry.path();
                        let file_name = entry.file_name().to_string_lossy().to_string();
                        
                        // Skip hidden files on Unix systems
                        if cfg!(unix) && file_name.starts_with('.') {
                            continue;
                        }
                        
                        let node_type = if metadata.is_dir() { "directory" } else { "file" };
                        let extension = if metadata.is_file() {
                            file_path.extension()
                                .and_then(|ext| ext.to_str())
                                .map(|s| format!(".{}", s))
                        } else {
                            None
                        };
                        
                        let modified = metadata.modified().ok().map(|t| {
                            DateTime::<Utc>::from(t)
                        });
                        
                        let created = metadata.created().ok().map(|t| {
                            DateTime::<Utc>::from(t)
                        });
                        
                        let node = FileSystemNode {
                            id: format!("{}-{}", path, file_name),
                            name: file_name,
                            path: file_path.to_string_lossy().to_string(),
                            node_type: node_type.to_string(),
                            size: if metadata.is_file() { Some(metadata.len()) } else { None },
                            modified,
                            created,
                            extension,
                            children: None,
                            expanded: Some(false),
                            is_virtual: Some(false),
                            content: None,
                        };
                        
                        nodes.push(node);
                    }
                }
            }
            
            // Sort nodes: directories first, then by name
            nodes.sort_by(|a, b| {
                match (a.node_type.as_str(), b.node_type.as_str()) {
                    ("directory", "file") => std::cmp::Ordering::Less,
                    ("file", "directory") => std::cmp::Ordering::Greater,
                    _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
                }
            });
            
            Ok(nodes)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

#[tauri::command]
pub async fn create_file(path: String, content: String) -> Result<(), String> {
    let file_path = Path::new(&path);
    
    // Create parent directories if they don't exist
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directories: {}", e))?;
        }
    }
    
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create file: {}", e)),
    }
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let file_path = Path::new(&path);
    
    if file_path.is_dir() {
        match fs::remove_dir_all(&path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete directory: {}", e)),
        }
    } else {
        match fs::remove_file(&path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete file: {}", e)),
        }
    }
}

#[tauri::command]
pub async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    match fs::rename(&old_path, &new_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to rename file: {}", e)),
    }
}

#[tauri::command]
pub async fn copy_file(source_path: String, target_path: String) -> Result<(), String> {
    let source = Path::new(&source_path);
    let target = Path::new(&target_path);
    
    // Create parent directories if they don't exist
    if let Some(parent) = target.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directories: {}", e))?;
        }
    }
    
    if source.is_dir() {
        copy_dir_recursive(source, target)
    } else {
        match fs::copy(&source_path, &target_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to copy file: {}", e)),
        }
    }
}

fn copy_dir_recursive(source: &Path, target: &Path) -> Result<(), String> {
    fs::create_dir_all(target).map_err(|e| format!("Failed to create directory: {}", e))?;
    
    for entry in fs::read_dir(source).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let file_name = entry.file_name();
        let target_path = target.join(&file_name);
        
        if path.is_dir() {
            copy_dir_recursive(&path, &target_path)?;
        } else {
            fs::copy(&path, &target_path)
                .map_err(|e| format!("Failed to copy file: {}", e))?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub async fn move_file(source_path: String, target_path: String) -> Result<(), String> {
    match fs::rename(&source_path, &target_path) {
        Ok(_) => Ok(()),
        Err(_) => {
            // If rename fails (e.g., across different filesystems), try copy + delete
            copy_file(source_path.clone(), target_path).await?;
            delete_file(source_path).await
        }
    }
}

#[tauri::command]
pub async fn search_files(options: FileSearchOptions) -> Result<Vec<FileSystemNode>, String> {
    let search_path = options.path.unwrap_or_else(|| ".".to_string());
    let query = options.query.to_lowercase();
    let include_hidden = options.include_hidden.unwrap_or(false);
    let case_sensitive = options.case_sensitive.unwrap_or(false);
    let max_depth = options.max_depth.unwrap_or(10);
    
    let mut results = Vec::new();
    search_files_recursive(
        Path::new(&search_path),
        &query,
        case_sensitive,
        include_hidden,
        &options.file_extensions,
        0,
        max_depth,
        &mut results,
    )?;
    
    Ok(results)
}

fn search_files_recursive(
    dir: &Path,
    query: &str,
    case_sensitive: bool,
    include_hidden: bool,
    extensions: &Option<Vec<String>>,
    current_depth: usize,
    max_depth: usize,
    results: &mut Vec<FileSystemNode>,
) -> Result<(), String> {
    if current_depth > max_depth {
        return Ok(());
    }
    
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();
        
        // Skip hidden files if not included
        if !include_hidden && file_name.starts_with('.') {
            continue;
        }
        
        // Check if file matches extensions filter
        if let Some(exts) = extensions {
            if path.is_file() {
                let has_matching_ext = path.extension()
                    .and_then(|ext| ext.to_str())
                    .map(|ext| exts.iter().any(|e| e.trim_start_matches('.') == ext))
                    .unwrap_or(false);
                
                if !has_matching_ext {
                    continue;
                }
            }
        }
        
        // Check if filename matches query
        let matches = if case_sensitive {
            file_name.contains(query)
        } else {
            file_name.to_lowercase().contains(&query.to_lowercase())
        };
        
        if matches {
            let metadata = entry.metadata().map_err(|e| format!("Failed to get metadata: {}", e))?;
            
            let node = FileSystemNode {
                id: path.to_string_lossy().to_string(),
                name: file_name.clone(),
                path: path.to_string_lossy().to_string(),
                node_type: if metadata.is_dir() { "directory" } else { "file" }.to_string(),
                size: if metadata.is_file() { Some(metadata.len()) } else { None },
                modified: metadata.modified().ok().map(|t| DateTime::<Utc>::from(t)),
                created: metadata.created().ok().map(|t| DateTime::<Utc>::from(t)),
                extension: path.extension()
                    .and_then(|ext| ext.to_str())
                    .map(|s| format!(".{}", s)),
                children: None,
                expanded: Some(false),
                is_virtual: Some(false),
                content: None,
            };
            
            results.push(node);
        }
        
        // Recursively search subdirectories
        if path.is_dir() {
            search_files_recursive(
                &path,
                query,
                case_sensitive,
                include_hidden,
                extensions,
                current_depth + 1,
                max_depth,
                results,
            )?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_file_stats(path: String) -> Result<FileSystemNode, String> {
    let file_path = Path::new(&path);
    
    match file_path.metadata() {
        Ok(metadata) => {
            let file_name = file_path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            
            Ok(FileSystemNode {
                id: path.clone(),
                name: file_name,
                path: path.clone(),
                node_type: if metadata.is_dir() { "directory" } else { "file" }.to_string(),
                size: if metadata.is_file() { Some(metadata.len()) } else { None },
                modified: metadata.modified().ok().map(|t| DateTime::<Utc>::from(t)),
                created: metadata.created().ok().map(|t| DateTime::<Utc>::from(t)),
                extension: file_path.extension()
                    .and_then(|ext| ext.to_str())
                    .map(|s| format!(".{}", s)),
                children: None,
                expanded: Some(false),
                is_virtual: Some(false),
                content: None,
            })
        }
        Err(e) => Err(format!("Failed to get file stats: {}", e)),
    }
}

#[tauri::command]
pub async fn path_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
pub async fn watch_directory(app: AppHandle, path: String) -> Result<(), String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            let _ = tx.send(event);
        }
    }).map_err(|e| format!("Failed to create watcher: {}", e))?;
    
    watcher.watch(Path::new(&path), RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch directory: {}", e))?;
    
    // Store the watcher
    {
        let mut watchers = WATCHERS.lock().unwrap();
        watchers.insert(path.clone(), watcher);
    }
    
    // Spawn a thread to handle events
    let app_handle = app.clone();
    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            let watch_event = match event.kind {
                notify::EventKind::Create(_) => Some(FileWatchEvent {
                    event_type: "created".to_string(),
                    path: event.paths.first().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                    old_path: None,
                    timestamp: Utc::now(),
                }),
                notify::EventKind::Modify(notify::event::ModifyKind::Name(_)) => {
                    if event.paths.len() >= 2 {
                        Some(FileWatchEvent {
                            event_type: "renamed".to_string(),
                            path: event.paths[1].to_string_lossy().to_string(),
                            old_path: Some(event.paths[0].to_string_lossy().to_string()),
                            timestamp: Utc::now(),
                        })
                    } else {
                        Some(FileWatchEvent {
                            event_type: "modified".to_string(),
                            path: event.paths.first().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                            old_path: None,
                            timestamp: Utc::now(),
                        })
                    }
                },
                notify::EventKind::Modify(_) => Some(FileWatchEvent {
                    event_type: "modified".to_string(),
                    path: event.paths.first().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                    old_path: None,
                    timestamp: Utc::now(),
                }),
                notify::EventKind::Remove(_) => Some(FileWatchEvent {
                    event_type: "deleted".to_string(),
                    path: event.paths.first().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                    old_path: None,
                    timestamp: Utc::now(),
                }),
                _ => None,
            };
            
            if let Some(watch_event) = watch_event {
                let _ = app_handle.emit("file-watch-event", watch_event);
            }
        }
    });
    
    Ok(())
}

#[tauri::command]
pub async fn unwatch_directory(path: String) -> Result<(), String> {
    let mut watchers = WATCHERS.lock().unwrap();
    watchers.remove(&path);
    Ok(())
}

#[tauri::command]
pub async fn get_home_dir() -> Result<String, String> {
    match env::var("HOME").or_else(|_| env::var("USERPROFILE")) {
        Ok(home) => Ok(home),
        Err(_) => {
            // Fallback to platform-specific methods
            #[cfg(target_os = "windows")]
            {
                match env::var("HOMEPATH") {
                    Ok(path) => {
                        let drive = env::var("HOMEDRIVE").unwrap_or_else(|_| "C:".to_string());
                        Ok(format!("{}{}", drive, path))
                    }
                    Err(_) => Err("Could not determine home directory".to_string())
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                match env::var("USER") {
                    Ok(user) => Ok(format!("/home/{}", user)),
                    Err(_) => Err("Could not determine home directory".to_string())
                }
            }
        }
    }
}