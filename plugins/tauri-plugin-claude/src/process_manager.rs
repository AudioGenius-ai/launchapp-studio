use crate::{Result, Error};

pub struct ProcessManager;

impl ProcessManager {
    pub fn new() -> Self {
        Self
    }

    /// Kill a process by PID
    pub async fn kill_process(&self, pid: u32) -> Result<()> {
        #[cfg(unix)]
        {
            use std::process::Command;
            
            let output = Command::new("kill")
                .args(&["-TERM", &pid.to_string()])
                .output()
                .map_err(|e| Error::ProcessStartError(format!("Failed to kill process: {}", e)))?;

            if !output.status.success() {
                // Try SIGKILL if SIGTERM failed
                let _ = Command::new("kill")
                    .args(&["-9", &pid.to_string()])
                    .output();
            }
        }

        #[cfg(windows)]
        {
            use std::process::Command;
            
            let _ = Command::new("taskkill")
                .args(&["/F", "/PID", &pid.to_string()])
                .output();
        }

        Ok(())
    }

    /// Check if a process is still running
    pub fn is_process_running(&self, pid: u32) -> bool {
        #[cfg(unix)]
        {
            use std::process::Command;
            
            let output = Command::new("kill")
                .args(&["-0", &pid.to_string()])
                .output();

            match output {
                Ok(result) => result.status.success(),
                Err(_) => false,
            }
        }

        #[cfg(windows)]
        {
            use std::process::Command;
            
            let output = Command::new("tasklist")
                .args(&["/FI", &format!("PID eq {}", pid)])
                .output();

            match output {
                Ok(result) => {
                    let output_str = String::from_utf8_lossy(&result.stdout);
                    output_str.contains(&pid.to_string())
                }
                Err(_) => false,
            }
        }
    }

    /// Find Claude processes by log file path
    pub async fn find_claude_processes(&self, log_path: &str) -> Vec<u32> {
        let mut pids = Vec::new();

        #[cfg(unix)]
        {
            use std::process::Command;
            
            // Try pgrep first
            if let Ok(output) = Command::new("pgrep")
                .args(&["-f", &format!("claude.*{}", log_path)])
                .output()
            {
                if output.status.success() {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    for line in output_str.lines() {
                        if let Ok(pid) = line.trim().parse::<u32>() {
                            pids.push(pid);
                        }
                    }
                }
            } else {
                // Fallback to ps
                if let Ok(output) = Command::new("ps")
                    .args(&["aux"])
                    .output()
                {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    for line in output_str.lines() {
                        if line.contains("claude") && line.contains(log_path) {
                            // Extract PID from ps output (second column)
                            if let Some(pid_str) = line.split_whitespace().nth(1) {
                                if let Ok(pid) = pid_str.parse::<u32>() {
                                    pids.push(pid);
                                }
                            }
                        }
                    }
                }
            }
        }

        pids
    }
}