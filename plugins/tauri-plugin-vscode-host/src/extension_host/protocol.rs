use crate::{error::{Error, Result}};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::oneshot;
use parking_lot::Mutex;
use std::sync::Arc;
use uuid::Uuid;

/// JSON-RPC protocol version
const JSONRPC_VERSION: &str = "2.0";

/// JSON-RPC request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub id: Option<JsonRpcId>,
    pub method: String,
    pub params: Option<Value>,
}

/// JSON-RPC response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub id: Option<JsonRpcId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<JsonRpcError>,
}

/// JSON-RPC notification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcNotification {
    pub jsonrpc: String,
    pub method: String,
    pub params: Option<Value>,
}

/// JSON-RPC error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

/// JSON-RPC ID type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum JsonRpcId {
    Number(i64),
    String(String),
}

/// Protocol handler for JSON-RPC communication
pub struct ProtocolHandler {
    /// Pending requests waiting for responses
    pending_requests: Arc<Mutex<HashMap<JsonRpcId, oneshot::Sender<JsonRpcResponse>>>>,
    /// Request handlers
    request_handlers: Arc<Mutex<HashMap<String, Box<dyn RequestHandler>>>>,
    /// Notification handlers
    notification_handlers: Arc<Mutex<HashMap<String, Box<dyn NotificationHandler>>>>,
}

/// Trait for handling requests
pub trait RequestHandler: Send + Sync {
    fn handle(&self, params: Option<Value>) -> Result<Value>;
}

/// Trait for handling notifications
pub trait NotificationHandler: Send + Sync {
    fn handle(&self, params: Option<Value>);
}

impl ProtocolHandler {
    /// Create a new protocol handler
    pub fn new() -> Self {
        Self {
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
            request_handlers: Arc::new(Mutex::new(HashMap::new())),
            notification_handlers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    /// Register a request handler
    pub fn register_request_handler<H>(&self, method: &str, handler: H)
    where
        H: RequestHandler + 'static,
    {
        self.request_handlers.lock()
            .insert(method.to_string(), Box::new(handler));
    }
    
    /// Register a notification handler
    pub fn register_notification_handler<H>(&self, method: &str, handler: H)
    where
        H: NotificationHandler + 'static,
    {
        self.notification_handlers.lock()
            .insert(method.to_string(), Box::new(handler));
    }
    
    /// Send a request and wait for response
    pub async fn send_request(
        &self,
        method: String,
        params: Option<Value>,
        send_fn: impl Fn(String) -> Result<()>,
    ) -> Result<Value> {
        let id = JsonRpcId::String(Uuid::new_v4().to_string());
        let request = JsonRpcRequest {
            jsonrpc: JSONRPC_VERSION.to_string(),
            id: Some(id.clone()),
            method,
            params,
        };
        
        // Create response channel
        let (tx, rx) = oneshot::channel();
        
        // Store pending request
        self.pending_requests.lock().insert(id, tx);
        
        // Send request
        let message = serde_json::to_string(&request)?;
        send_fn(message)?;
        
        // Wait for response
        let response = rx.await
            .map_err(|_| Error::IpcError("Request cancelled".to_string()))?;
        
        if let Some(error) = response.error {
            return Err(Error::ApiError(format!("{}: {}", error.code, error.message)));
        }
        
        response.result.ok_or_else(|| Error::ApiError("Empty response".to_string()))
    }
    
    /// Send a notification
    pub fn send_notification(
        &self,
        method: String,
        params: Option<Value>,
        send_fn: impl Fn(String) -> Result<()>,
    ) -> Result<()> {
        let notification = JsonRpcNotification {
            jsonrpc: JSONRPC_VERSION.to_string(),
            method,
            params,
        };
        
        let message = serde_json::to_string(&notification)?;
        send_fn(message)
    }
    
    /// Handle incoming message
    pub fn handle_message(&self, message: &str) -> Result<Option<String>> {
        // Try to parse as request
        if let Ok(request) = serde_json::from_str::<JsonRpcRequest>(message) {
            return self.handle_request(request);
        }
        
        // Try to parse as response
        if let Ok(response) = serde_json::from_str::<JsonRpcResponse>(message) {
            self.handle_response(response);
            return Ok(None);
        }
        
        // Try to parse as notification
        if let Ok(notification) = serde_json::from_str::<JsonRpcNotification>(message) {
            self.handle_notification(notification);
            return Ok(None);
        }
        
        Err(Error::IpcError("Invalid JSON-RPC message".to_string()))
    }
    
    /// Handle incoming request
    fn handle_request(&self, request: JsonRpcRequest) -> Result<Option<String>> {
        let handlers = self.request_handlers.lock();
        
        if let Some(handler) = handlers.get(&request.method) {
            let response = match handler.handle(request.params.clone()) {
                Ok(result) => JsonRpcResponse {
                    jsonrpc: JSONRPC_VERSION.to_string(),
                    id: request.id,
                    result: Some(result),
                    error: None,
                },
                Err(e) => JsonRpcResponse {
                    jsonrpc: JSONRPC_VERSION.to_string(),
                    id: request.id,
                    result: None,
                    error: Some(JsonRpcError {
                        code: -32603,
                        message: e.to_string(),
                        data: None,
                    }),
                },
            };
            
            let message = serde_json::to_string(&response)?;
            Ok(Some(message))
        } else {
            // Method not found
            let response = JsonRpcResponse {
                jsonrpc: JSONRPC_VERSION.to_string(),
                id: request.id,
                result: None,
                error: Some(JsonRpcError {
                    code: -32601,
                    message: format!("Method not found: {}", request.method),
                    data: None,
                }),
            };
            
            let message = serde_json::to_string(&response)?;
            Ok(Some(message))
        }
    }
    
    /// Handle incoming response
    fn handle_response(&self, response: JsonRpcResponse) {
        if let Some(ref id) = response.id {
            if let Some(tx) = self.pending_requests.lock().remove(id) {
                let _ = tx.send(response);
            }
        }
    }
    
    /// Handle incoming notification
    fn handle_notification(&self, notification: JsonRpcNotification) {
        let handlers = self.notification_handlers.lock();
        
        if let Some(handler) = handlers.get(&notification.method) {
            handler.handle(notification.params);
        }
    }
}

/// Standard JSON-RPC error codes
pub mod error_codes {
    pub const PARSE_ERROR: i32 = -32700;
    pub const INVALID_REQUEST: i32 = -32600;
    pub const METHOD_NOT_FOUND: i32 = -32601;
    pub const INVALID_PARAMS: i32 = -32602;
    pub const INTERNAL_ERROR: i32 = -32603;
}

#[cfg(test)]
mod tests {
    use super::*;
    
    struct TestHandler;
    
    impl RequestHandler for TestHandler {
        fn handle(&self, params: Option<Value>) -> Result<Value> {
            Ok(params.unwrap_or(Value::Null))
        }
    }
    
    impl NotificationHandler for TestHandler {
        fn handle(&self, _params: Option<Value>) {
            // Do nothing
        }
    }
    
    #[test]
    fn test_protocol_handler() {
        let handler = ProtocolHandler::new();
        handler.register_request_handler("test", TestHandler);
        
        let request = r#"{"jsonrpc":"2.0","id":"1","method":"test","params":{"foo":"bar"}}"#;
        let response = handler.handle_message(request).unwrap();
        
        assert!(response.is_some());
        let response = response.unwrap();
        assert!(response.contains("\"result\""));
        assert!(response.contains("\"foo\":\"bar\""));
    }
}