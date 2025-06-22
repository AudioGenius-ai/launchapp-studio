use crate::error::{ProjectManagementError, Result};
use regex::Regex;

// Validation utilities

pub fn validate_task_key_format(key: &str) -> Result<()> {
    let re = Regex::new(r"^[A-Z]{2,10}-\d+$").unwrap();
    if !re.is_match(key) {
        return Err(ProjectManagementError::ValidationError {
            field: "task_key".to_string(),
            message: "Task key must be in format PROJECT-123".to_string(),
        });
    }
    Ok(())
}

pub fn validate_email(email: &str) -> Result<()> {
    let re = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    if !re.is_match(email) {
        return Err(ProjectManagementError::ValidationError {
            field: "email".to_string(),
            message: "Invalid email format".to_string(),
        });
    }
    Ok(())
}

pub fn validate_url(url: &str) -> Result<()> {
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(ProjectManagementError::ValidationError {
            field: "url".to_string(),
            message: "URL must start with http:// or https://".to_string(),
        });
    }
    Ok(())
}

// Search utilities

pub fn extract_search_terms(query: &str) -> Vec<String> {
    query
        .split_whitespace()
        .map(|term| term.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string())
        .filter(|term| !term.is_empty() && term.len() > 2)
        .collect()
}

pub fn calculate_search_relevance(content: &str, terms: &[String]) -> f64 {
    let content_lower = content.to_lowercase();
    let mut score = 0.0;
    
    for term in terms {
        let matches = content_lower.matches(term).count();
        score += matches as f64;
    }
    
    // Normalize by content length
    if content.len() > 0 {
        score / (content.len() as f64 / 100.0)
    } else {
        0.0
    }
}

// Export/Import utilities

pub fn sanitize_filename(filename: &str) -> String {
    let re = Regex::new(r"[^a-zA-Z0-9._-]").unwrap();
    re.replace_all(filename, "_").to_string()
}

// Statistics utilities

pub fn calculate_completion_percentage(completed: u32, total: u32) -> f64 {
    if total == 0 {
        0.0
    } else {
        (completed as f64 / total as f64) * 100.0
    }
}

pub fn generate_color_for_priority(priority: &str) -> String {
    match priority.to_lowercase().as_str() {
        "urgent" => "#ff4444".to_string(),
        "high" => "#ff8800".to_string(),
        "medium" => "#ffcc00".to_string(),
        "low" => "#00cc44".to_string(),
        _ => "#666666".to_string(),
    }
}

pub fn generate_color_for_status(status: &str) -> String {
    match status.to_lowercase().as_str() {
        "todo" => "#e0e0e0".to_string(),
        "in_progress" | "in progress" => "#4488ff".to_string(),
        "done" => "#44cc44".to_string(),
        "blocked" => "#ff4444".to_string(),
        _ => "#666666".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_task_key_format() {
        assert!(validate_task_key_format("PROJ-123").is_ok());
        assert!(validate_task_key_format("AB-1").is_ok());
        assert!(validate_task_key_format("VERYLONGKEY-999").is_ok());
        
        assert!(validate_task_key_format("proj-123").is_err());
        assert!(validate_task_key_format("PROJ123").is_err());
        assert!(validate_task_key_format("P-123").is_err());
    }

    #[test]
    fn test_extract_search_terms() {
        let terms = extract_search_terms("hello world test");
        assert_eq!(terms, vec!["hello", "world", "test"]);
        
        let terms = extract_search_terms("API documentation for users");
        assert_eq!(terms, vec!["documentation", "users"]);
    }

    #[test]
    fn test_calculate_completion_percentage() {
        assert_eq!(calculate_completion_percentage(0, 10), 0.0);
        assert_eq!(calculate_completion_percentage(5, 10), 50.0);
        assert_eq!(calculate_completion_percentage(10, 10), 100.0);
        assert_eq!(calculate_completion_percentage(0, 0), 0.0);
    }
}