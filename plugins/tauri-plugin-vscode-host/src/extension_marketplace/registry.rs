use crate::{error::Result, models::*};

/// Extension registry client
pub struct ExtensionRegistry {
    base_url: String,
}

impl ExtensionRegistry {
    pub fn new(base_url: String) -> Self {
        Self { base_url }
    }
    
    /// Search for extensions
    pub async fn search(&self, query: ExtensionSearchQuery) -> Result<ExtensionSearchResult> {
        // TODO: Implement Open VSX API search
        Ok(ExtensionSearchResult {
            extensions: vec![],
            total: 0,
            offset: query.offset.unwrap_or(0),
        })
    }
}