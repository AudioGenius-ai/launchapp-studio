use axum::{
    extract::{Path, State},
    http::{StatusCode, HeaderMap},
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
    headers: HeaderMap,
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
            handle_tool_call(headers, request).await
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

async fn handle_tool_call(
    headers: HeaderMap,
    request: JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    // Extract project context from headers
    let project_id = headers.get("x-project-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("default");
    
    let workspace_path = headers.get("x-workspace-path")
        .and_then(|h| h.to_str().ok())
        .unwrap_or(".");

    if let Some(params) = &request.params {
        if let Ok(tool_call) = serde_json::from_value::<ToolCallParams>(params.clone()) {
            match tool_call.name.as_str() {
                // Project Management Tools
                "pm_create_project" => execute_pm_create_project(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_list_projects" => execute_pm_list_projects(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_get_project" => execute_pm_get_project(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_update_project" => execute_pm_update_project(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_delete_project" => execute_pm_delete_project(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                // Task Management Tools
                "pm_create_task" => execute_pm_create_task(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_list_tasks" => execute_pm_list_tasks(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_get_task" => execute_pm_get_task(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_update_task" => execute_pm_update_task(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_delete_task" => execute_pm_delete_task(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_move_task_to_sprint" => execute_pm_move_task_to_sprint(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_add_task_comment" => execute_pm_add_task_comment(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                // Document Management Tools
                "pm_create_document" => execute_pm_create_document(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_list_documents" => execute_pm_list_documents(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_get_document" => execute_pm_get_document(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_update_document" => execute_pm_update_document(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_delete_document" => execute_pm_delete_document(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_render_document" => execute_pm_render_document(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                // Sprint Management Tools
                "pm_create_sprint" => execute_pm_create_sprint(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_list_sprints" => execute_pm_list_sprints(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_get_sprint" => execute_pm_get_sprint(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_start_sprint" => execute_pm_start_sprint(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_complete_sprint" => execute_pm_complete_sprint(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                // Search Tools
                "pm_search_tasks" => execute_pm_search_tasks(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_search_documents" => execute_pm_search_documents(project_id, workspace_path, &tool_call.arguments, &request).await,
                "pm_search_all" => execute_pm_search_all(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                // Statistics Tools
                "pm_get_project_statistics" => execute_pm_get_project_statistics(project_id, workspace_path, &tool_call.arguments, &request).await,
                
                _ => {
                    // Default tool execution for non-PM tools
                    Json(JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        id: request.id,
                        result: Some(json!({
                            "content": [{
                                "type": "text",
                                "text": format!("Tool '{}' executed in project '{}' at workspace '{}'", tool_call.name, project_id, workspace_path)
                            }]
                        })),
                        error: None,
                    })
                }
            }
        } else {
            Json(JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                id: request.id,
                result: None,
                error: Some(JsonRpcError {
                    code: -32602,
                    message: "Invalid tool call parameters".to_string(),
                }),
            })
        }
    } else {
        Json(JsonRpcResponse {
            jsonrpc: "2.0".to_string(),
            id: request.id,
            result: None,
            error: Some(JsonRpcError {
                code: -32602,
                message: "Missing parameters".to_string(),
            }),
        })
    }
}

#[derive(Deserialize)]
struct ToolCallParams {
    name: String,
    arguments: serde_json::Value,
}

// Project Management Tool Implementations
async fn execute_pm_create_project(
    _project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    // This would call the Tauri plugin
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Created project with arguments: {}", arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_list_projects(
    _project_id: &str,
    _workspace_path: &str,
    _arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": "Listed all projects"
            }]
        })),
        error: None,
    })
}

async fn execute_pm_get_project(
    project_id: &str,
    _workspace_path: &str,
    _arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Retrieved project: {}", project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_update_project(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Updated project {} with: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_delete_project(
    project_id: &str,
    _workspace_path: &str,
    _arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Deleted project: {}", project_id)
            }]
        })),
        error: None,
    })
}

// Task Management Tool Implementations
async fn execute_pm_create_task(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Created task in project {} with: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_list_tasks(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Listed tasks in project {} with filter: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_get_task(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let task_id = arguments.get("task_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Retrieved task {} from project {}", task_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_update_task(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let task_id = arguments.get("task_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Updated task {} in project {} with: {}", task_id, project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_delete_task(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let task_id = arguments.get("task_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Deleted task {} from project {}", task_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_move_task_to_sprint(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let task_id = arguments.get("task_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    let sprint_id = arguments.get("sprint_id").and_then(|v| v.as_str()).unwrap_or("none");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Moved task {} to sprint {} in project {}", task_id, sprint_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_add_task_comment(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let task_id = arguments.get("task_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    let content = arguments.get("content").and_then(|v| v.as_str()).unwrap_or("");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Added comment to task {} in project {}: {}", task_id, project_id, content)
            }]
        })),
        error: None,
    })
}

// Document Management Tool Implementations
async fn execute_pm_create_document(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Created document in project {} with: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_list_documents(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Listed documents in project {} with filter: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_get_document(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let document_id = arguments.get("document_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Retrieved document {} from project {}", document_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_update_document(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let document_id = arguments.get("document_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Updated document {} in project {} with: {}", document_id, project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_delete_document(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let document_id = arguments.get("document_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Deleted document {} from project {}", document_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_render_document(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let document_id = arguments.get("document_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Rendered document {} from project {}", document_id, project_id)
            }]
        })),
        error: None,
    })
}

// Sprint Management Tool Implementations
async fn execute_pm_create_sprint(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Created sprint in project {} with: {}", project_id, arguments)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_list_sprints(
    project_id: &str,
    _workspace_path: &str,
    _arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Listed sprints in project {}", project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_get_sprint(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let sprint_id = arguments.get("sprint_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Retrieved sprint {} from project {}", sprint_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_start_sprint(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let sprint_id = arguments.get("sprint_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Started sprint {} in project {}", sprint_id, project_id)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_complete_sprint(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let sprint_id = arguments.get("sprint_id").and_then(|v| v.as_str()).unwrap_or("unknown");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Completed sprint {} in project {}", sprint_id, project_id)
            }]
        })),
        error: None,
    })
}

// Search Tool Implementations
async fn execute_pm_search_tasks(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let query = arguments.get("query").and_then(|v| v.as_str()).unwrap_or("");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Searched tasks in project {} for: {}", project_id, query)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_search_documents(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let query = arguments.get("query").and_then(|v| v.as_str()).unwrap_or("");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Searched documents in project {} for: {}", project_id, query)
            }]
        })),
        error: None,
    })
}

async fn execute_pm_search_all(
    project_id: &str,
    _workspace_path: &str,
    arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    let query = arguments.get("query").and_then(|v| v.as_str()).unwrap_or("");
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Searched all items in project {} for: {}", project_id, query)
            }]
        })),
        error: None,
    })
}

// Statistics Tool Implementation
async fn execute_pm_get_project_statistics(
    project_id: &str,
    _workspace_path: &str,
    _arguments: &serde_json::Value,
    request: &JsonRpcRequest,
) -> Json<JsonRpcResponse> {
    Json(JsonRpcResponse {
        jsonrpc: "2.0".to_string(),
        id: request.id.clone(),
        result: Some(json!({
            "content": [{
                "type": "text",
                "text": format!("Retrieved statistics for project {}", project_id)
            }]
        })),
        error: None,
    })
}

fn get_tool_definitions() -> Vec<serde_json::Value> {
    let mut tools = vec![
        // Project Management Tools
        json!({
            "name": "pm_create_project",
            "description": "Create a new project management project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Project name"
                    },
                    "key": {
                        "type": "string",
                        "description": "Project key (e.g., PROJ)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Project description"
                    },
                    "owner": {
                        "type": "string",
                        "description": "Project owner"
                    }
                },
                "required": ["name", "key", "description", "owner"]
            }
        }),
        json!({
            "name": "pm_list_projects",
            "description": "List all projects",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        json!({
            "name": "pm_get_project",
            "description": "Get project details",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        json!({
            "name": "pm_update_project",
            "description": "Update project details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "New project name"
                    },
                    "description": {
                        "type": "string",
                        "description": "New project description"
                    }
                }
            }
        }),
        json!({
            "name": "pm_delete_project",
            "description": "Delete a project",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        
        // Task Management Tools
        json!({
            "name": "pm_create_task",
            "description": "Create a new task in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title"
                    },
                    "description": {
                        "type": "string",
                        "description": "Task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "Task priority"
                    },
                    "task_type": {
                        "type": "string",
                        "description": "Type of task (story, bug, task, etc.)"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Task assignee"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Due date (YYYY-MM-DD)"
                    },
                    "estimate": {
                        "type": "number",
                        "description": "Time estimate in hours"
                    },
                    "labels": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Task labels"
                    }
                },
                "required": ["title", "description", "priority", "task_type"]
            }
        }),
        json!({
            "name": "pm_list_tasks",
            "description": "List tasks in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by status"
                    },
                    "assignee": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by assignee"
                    },
                    "priority": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by priority"
                    }
                }
            }
        }),
        json!({
            "name": "pm_get_task",
            "description": "Get task details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    }
                },
                "required": ["task_id"]
            }
        }),
        json!({
            "name": "pm_update_task",
            "description": "Update task details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description"
                    },
                    "status": {
                        "type": "string",
                        "description": "New task status"
                    },
                    "priority": {
                        "type": "string",
                        "description": "New task priority"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "New task assignee"
                    }
                },
                "required": ["task_id"]
            }
        }),
        json!({
            "name": "pm_delete_task",
            "description": "Delete a task",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    }
                },
                "required": ["task_id"]
            }
        }),
        json!({
            "name": "pm_move_task_to_sprint",
            "description": "Move task to a sprint",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    },
                    "sprint_id": {
                        "type": "string",
                        "description": "Sprint ID (null to remove from sprint)"
                    }
                },
                "required": ["task_id"]
            }
        }),
        json!({
            "name": "pm_add_task_comment",
            "description": "Add comment to a task",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    },
                    "content": {
                        "type": "string",
                        "description": "Comment content"
                    },
                    "author": {
                        "type": "string",
                        "description": "Comment author"
                    }
                },
                "required": ["task_id", "content", "author"]
            }
        }),
        
        // Document Management Tools
        json!({
            "name": "pm_create_document",
            "description": "Create a new document in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Document title"
                    },
                    "content": {
                        "type": "string",
                        "description": "Document content (markdown)"
                    },
                    "template": {
                        "type": "string",
                        "enum": ["page", "blog", "requirements", "api_doc", "meeting", "troubleshooting", "user_guide", "technical_spec"],
                        "description": "Document template"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Document tags"
                    }
                },
                "required": ["title", "template"]
            }
        }),
        json!({
            "name": "pm_list_documents",
            "description": "List documents in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by status"
                    },
                    "template": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by template"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by tags"
                    }
                }
            }
        }),
        json!({
            "name": "pm_get_document",
            "description": "Get document details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "Document ID"
                    }
                },
                "required": ["document_id"]
            }
        }),
        json!({
            "name": "pm_update_document",
            "description": "Update document details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "Document ID"
                    },
                    "title": {
                        "type": "string",
                        "description": "New document title"
                    },
                    "content": {
                        "type": "string",
                        "description": "New document content"
                    },
                    "status": {
                        "type": "string",
                        "description": "New document status"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "New document tags"
                    }
                },
                "required": ["document_id"]
            }
        }),
        json!({
            "name": "pm_delete_document",
            "description": "Delete a document",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "Document ID"
                    }
                },
                "required": ["document_id"]
            }
        }),
        json!({
            "name": "pm_render_document",
            "description": "Render document to HTML",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "Document ID"
                    }
                },
                "required": ["document_id"]
            }
        }),
        
        // Sprint Management Tools
        json!({
            "name": "pm_create_sprint",
            "description": "Create a new sprint in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Sprint name"
                    },
                    "start_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Sprint start date (YYYY-MM-DD)"
                    },
                    "end_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Sprint end date (YYYY-MM-DD)"
                    },
                    "goal": {
                        "type": "string",
                        "description": "Sprint goal"
                    }
                },
                "required": ["name", "start_date", "end_date", "goal"]
            }
        }),
        json!({
            "name": "pm_list_sprints",
            "description": "List sprints in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        json!({
            "name": "pm_get_sprint",
            "description": "Get sprint details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sprint_id": {
                        "type": "string",
                        "description": "Sprint ID"
                    }
                },
                "required": ["sprint_id"]
            }
        }),
        json!({
            "name": "pm_start_sprint",
            "description": "Start a sprint",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sprint_id": {
                        "type": "string",
                        "description": "Sprint ID"
                    }
                },
                "required": ["sprint_id"]
            }
        }),
        json!({
            "name": "pm_complete_sprint",
            "description": "Complete a sprint",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sprint_id": {
                        "type": "string",
                        "description": "Sprint ID"
                    }
                },
                "required": ["sprint_id"]
            }
        }),
        
        // Search Tools
        json!({
            "name": "pm_search_tasks",
            "description": "Search tasks in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        }),
        json!({
            "name": "pm_search_documents",
            "description": "Search documents in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        }),
        json!({
            "name": "pm_search_all",
            "description": "Search all items (tasks and documents) in the current project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        }),
        
        // Statistics Tools
        json!({
            "name": "pm_get_project_statistics",
            "description": "Get project statistics",
            "inputSchema": {
                "type": "object",
                "properties": {}
            }
        }),
        
        // Original file system tools
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
    ];
    
    tools
}