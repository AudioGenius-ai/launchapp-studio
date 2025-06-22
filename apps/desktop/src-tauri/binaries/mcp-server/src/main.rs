use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{Json, sse::{Event, Sse}},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower_http::cors::CorsLayer;
use futures::stream::{self, Stream};
use std::convert::Infallible;
use tokio_stream::StreamExt as _;

#[derive(Clone)]
struct AppState {
    started_at: chrono::DateTime<chrono::Utc>,
    port: u16,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    port: u16,
    #[serde(rename = "startedAt")]
    started_at: String,
    uptime: f64,
}

#[derive(Deserialize, Serialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    id: serde_json::Value,
    method: String,
    params: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    id: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<JsonRpcError>,
}

#[derive(Serialize)]
struct JsonRpcError {
    code: i32,
    message: String,
}

#[derive(Deserialize)]
struct TauriBridgeRequest {
    #[serde(rename = "sessionId")]
    session_id: String,
    args: serde_json::Value,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Find available port
    let port = portpicker::pick_unused_port().expect("No ports available");
    
    let state = Arc::new(AppState {
        started_at: chrono::Utc::now(),
        port,
    });

    // Build our application with routes
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/mcp", post(handle_mcp))
        .route("/mcp/sse/:session_id", get(handle_sse))
        .route("/mcp/messages", post(handle_legacy_message))
        .route("/tauri-bridge/:method", post(handle_tauri_bridge))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    
    // Write port file for Tauri
    tokio::fs::write(".sidecar-port", port.to_string())
        .await
        .expect("Failed to write port file");
    
    println!("Sidecar server running on http://localhost:{}", port);
    println!("Port file written: .sidecar-port");

    // Run the server
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    let uptime = chrono::Utc::now()
        .signed_duration_since(state.started_at)
        .num_seconds() as f64;
    
    Json(HealthResponse {
        status: "ok",
        port: state.port,
        started_at: state.started_at.to_rfc3339(),
        uptime,
    })
}

async fn handle_mcp(
    State(_state): State<Arc<AppState>>,
    Json(request): Json<JsonRpcRequest>,
) -> Json<JsonRpcResponse> {
    match request.method.as_str() {
        "initialize" => {
            Json(JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                id: request.id,
                result: Some(json!({
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {},
                        "resources": {}
                    },
                    "serverInfo": {
                        "name": "codepilot-ide",
                        "version": "1.0.0"
                    }
                })),
                error: None,
            })
        }
        "tools/list" => {
            Json(JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                id: request.id,
                result: Some(json!({
                    "tools": get_tool_definitions()
                })),
                error: None,
            })
        }
        "tools/call" => {
            // In a real implementation, this would call back to Tauri
            Json(JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                id: request.id,
                result: Some(json!({
                    "content": [{
                        "type": "text",
                        "text": "Tool execution would happen here"
                    }]
                })),
                error: None,
            })
        }
        _ => {
            Json(JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                id: request.id,
                result: None,
                error: Some(JsonRpcError {
                    code: -32601,
                    message: "Method not found".to_string(),
                }),
            })
        }
    }
}

async fn handle_sse(
    Path(_session_id): Path<String>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    // Create a simple ping stream for now
    let stream = stream::repeat_with(|| {
        Ok(Event::default()
            .event("ping")
            .data(json!({"type": "ping", "timestamp": chrono::Utc::now().to_rfc3339()}).to_string()))
    })
    .throttle(Duration::from_secs(30));

    Sse::new(stream)
}

async fn handle_legacy_message(
    Json(_request): Json<JsonRpcRequest>,
) -> Json<serde_json::Value> {
    // Legacy endpoint - just return success
    Json(json!({
        "success": true
    }))
}

async fn handle_tauri_bridge(
    Path(method): Path<String>,
    Json(request): Json<TauriBridgeRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // In production, this would communicate with Tauri
    // For now, return mock response
    Ok(Json(json!({
        "success": true,
        "result": {
            "method": method,
            "sessionId": request.session_id,
            "args": request.args
        }
    })))
}

fn get_tool_definitions() -> Vec<serde_json::Value> {
    vec![
        json!({
            "name": "read_file",
            "description": "Read the contents of a file",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the file to read"
                    }
                },
                "required": ["path"]
            }
        }),
        json!({
            "name": "write_file",
            "description": "Write content to a file",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the file to write"
                    },
                    "content": {
                        "type": "string",
                        "description": "Content to write to the file"
                    }
                },
                "required": ["path", "content"]
            }
        }),
        json!({
            "name": "list_directory",
            "description": "List files in a directory",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the directory"
                    }
                },
                "required": ["path"]
            }
        }),
        json!({
            "name": "execute_command",
            "description": "Execute a command in the terminal",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Command to execute"
                    }
                },
                "required": ["command"]
            }
        }),
        json!({
            "name": "git_status",
            "description": "Get git status of the repository",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        json!({
            "name": "git_diff",
            "description": "Get git diff of changes",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "staged": {
                        "type": "boolean",
                        "description": "Show staged changes"
                    }
                }
            }
        }),
        json!({
            "name": "git_commit",
            "description": "Create a git commit",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Commit message"
                    }
                },
                "required": ["message"]
            }
        }),
        json!({
            "name": "search_files",
            "description": "Search for text in files",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "Search pattern"
                    },
                    "path": {
                        "type": "string",
                        "description": "Directory to search in"
                    }
                },
                "required": ["pattern"]
            }
        }),
        json!({
            "name": "find_files",
            "description": "Find files by name pattern",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "File name pattern (glob)"
                    }
                },
                "required": ["pattern"]
            }
        })
    ]
}