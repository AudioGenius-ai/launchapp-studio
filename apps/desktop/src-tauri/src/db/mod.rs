use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use std::fs;
use tauri::AppHandle;

pub async fn init_db(app_handle: &AppHandle) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    let app_dir = app_handle.path_resolver()
        .app_data_dir()
        .expect("Failed to get app data dir");
    
    // Create app data directory if it doesn't exist
    fs::create_dir_all(&app_dir)?;
    
    let db_path = app_dir.join("code_pilot.db");
    let db_url = format!("sqlite:{}", db_path.display());
    
    // Create connection pool
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
    
    Ok(pool)
}