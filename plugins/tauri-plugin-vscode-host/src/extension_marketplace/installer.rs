use crate::{error::{Error, Result}, models::*};

/// Extension installer
pub struct ExtensionInstaller {
    // TODO: Implement extension installer
}

impl ExtensionInstaller {
    pub fn new() -> Self {
        Self {}
    }
    
    /// Install an extension from source
    pub async fn install(&self, source: ExtensionSource) -> Result<ExtensionInstallResult> {
        match source {
            ExtensionSource::OpenVsx { .. } => {
                Err(Error::InstallationFailed("Not implemented".to_string()))
            }
            ExtensionSource::GitHub { .. } => {
                Err(Error::InstallationFailed("Not implemented".to_string()))
            }
            ExtensionSource::Local { .. } => {
                Err(Error::InstallationFailed("Not implemented".to_string()))
            }
            ExtensionSource::Url { .. } => {
                Err(Error::InstallationFailed("Not implemented".to_string()))
            }
        }
    }
}