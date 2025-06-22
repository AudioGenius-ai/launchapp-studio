use crate::models::ShellInfo;

// Get the default shell for the current platform
pub fn get_default_shell() -> String {
    #[cfg(target_os = "windows")]
    {
        std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string())
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    }
}

// Get available shells for the current platform
pub fn get_available_shells() -> Vec<ShellInfo> {
    #[cfg(target_os = "windows")]
    {
        vec![
            ShellInfo { path: "cmd.exe".to_string(), name: "Command Prompt".to_string() },
            ShellInfo { path: "powershell.exe".to_string(), name: "PowerShell".to_string() },
            ShellInfo { path: "pwsh.exe".to_string(), name: "PowerShell Core".to_string() },
        ]
    }
    
    #[cfg(target_os = "macos")]
    {
        let mut shells = vec![
            ShellInfo { path: "/bin/bash".to_string(), name: "Bash".to_string() },
            ShellInfo { path: "/bin/zsh".to_string(), name: "Zsh".to_string() },
            ShellInfo { path: "/bin/sh".to_string(), name: "Sh".to_string() },
        ];
        
        // Check for additional shells
        if std::path::Path::new("/opt/homebrew/bin/fish").exists() {
            shells.push(ShellInfo { path: "/opt/homebrew/bin/fish".to_string(), name: "Fish".to_string() });
        }
        if std::path::Path::new("/usr/local/bin/fish").exists() {
            shells.push(ShellInfo { path: "/usr/local/bin/fish".to_string(), name: "Fish".to_string() });
        }
        
        shells
    }
    
    #[cfg(target_os = "linux")]
    {
        let mut shells = vec![
            ShellInfo { path: "/bin/bash".to_string(), name: "Bash".to_string() },
            ShellInfo { path: "/bin/sh".to_string(), name: "Sh".to_string() },
        ];
        
        // Check for additional shells
        if std::path::Path::new("/bin/zsh").exists() {
            shells.push(ShellInfo { path: "/bin/zsh".to_string(), name: "Zsh".to_string() });
        }
        if std::path::Path::new("/usr/bin/fish").exists() {
            shells.push(ShellInfo { path: "/usr/bin/fish".to_string(), name: "Fish".to_string() });
        }
        
        shells
    }
}