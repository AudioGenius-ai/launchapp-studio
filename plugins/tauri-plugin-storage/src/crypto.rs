use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{rand_core::RngCore, PasswordHasher, SaltString},
    Argon2,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use crate::{Error, Result, EncryptionKey};

const NONCE_SIZE: usize = 12;
const KEY_SIZE: usize = 32;

pub struct CryptoService;

impl CryptoService {
    pub fn derive_key(password: &str, salt: &[u8]) -> Result<EncryptionKey> {
        let argon2 = Argon2::default();
        let salt_string = SaltString::encode_b64(salt)
            .map_err(|e| Error::KeyDerivation(e.to_string()))?;
        
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt_string)?;
        
        let hash = password_hash.hash.ok_or_else(|| {
            Error::KeyDerivation("Failed to get password hash".to_string())
        })?;
        
        let key_bytes = hash.as_bytes();
        if key_bytes.len() < KEY_SIZE {
            return Err(Error::KeyDerivation("Derived key too short".to_string()));
        }
        
        Ok(EncryptionKey {
            key: key_bytes[..KEY_SIZE].to_vec(),
        })
    }
    
    pub fn generate_salt() -> Vec<u8> {
        let mut salt = vec![0u8; 16];
        OsRng.fill_bytes(&mut salt);
        salt
    }
    
    pub fn generate_nonce() -> Vec<u8> {
        let mut nonce = vec![0u8; NONCE_SIZE];
        OsRng.fill_bytes(&mut nonce);
        nonce
    }
    
    pub fn encrypt(data: &[u8], key: &EncryptionKey, nonce: &[u8]) -> Result<Vec<u8>> {
        if nonce.len() != NONCE_SIZE {
            return Err(Error::Encryption("Invalid nonce size".to_string()));
        }
        
        let cipher = Aes256Gcm::new_from_slice(&key.key)
            .map_err(|e| Error::Encryption(e.to_string()))?;
        
        let nonce = Nonce::from_slice(nonce);
        cipher
            .encrypt(nonce, data)
            .map_err(|e| Error::Encryption(e.to_string()))
    }
    
    pub fn decrypt(encrypted_data: &[u8], key: &EncryptionKey, nonce: &[u8]) -> Result<Vec<u8>> {
        if nonce.len() != NONCE_SIZE {
            return Err(Error::Decryption("Invalid nonce size".to_string()));
        }
        
        let cipher = Aes256Gcm::new_from_slice(&key.key)
            .map_err(|e| Error::Decryption(e.to_string()))?;
        
        let nonce = Nonce::from_slice(nonce);
        cipher
            .decrypt(nonce, encrypted_data)
            .map_err(|e| Error::Decryption(e.to_string()))
    }
    
    pub fn encode_base64(data: &[u8]) -> String {
        BASE64.encode(data)
    }
    
    pub fn decode_base64(encoded: &str) -> Result<Vec<u8>> {
        BASE64
            .decode(encoded)
            .map_err(|e| Error::Decryption(format!("Base64 decode error: {}", e)))
    }
}