"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
var TauriEvent;
(function(TauriEvent2) {
  TauriEvent2["WINDOW_RESIZED"] = "tauri://resize";
  TauriEvent2["WINDOW_MOVED"] = "tauri://move";
  TauriEvent2["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
  TauriEvent2["WINDOW_DESTROYED"] = "tauri://destroyed";
  TauriEvent2["WINDOW_FOCUS"] = "tauri://focus";
  TauriEvent2["WINDOW_BLUR"] = "tauri://blur";
  TauriEvent2["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
  TauriEvent2["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
  TauriEvent2["WINDOW_CREATED"] = "tauri://window-created";
  TauriEvent2["WEBVIEW_CREATED"] = "tauri://webview-created";
  TauriEvent2["DRAG_ENTER"] = "tauri://drag-enter";
  TauriEvent2["DRAG_OVER"] = "tauri://drag-over";
  TauriEvent2["DRAG_DROP"] = "tauri://drag-drop";
  TauriEvent2["DRAG_LEAVE"] = "tauri://drag-leave";
})(TauriEvent || (TauriEvent = {}));
async function _unlisten(event, eventId) {
  await invoke("plugin:event|unlisten", {
    event,
    eventId
  });
}
async function listen(event, handler, options) {
  var _a;
  const target = (_a = void 0) !== null && _a !== void 0 ? _a : { kind: "Any" };
  return invoke("plugin:event|listen", {
    event,
    target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}
async function createSession(options) {
  return await invoke("plugin:claude|create_session", { options });
}
async function sendInput(options) {
  return await invoke("plugin:claude|send_input", { options });
}
async function listSessions() {
  return await invoke("plugin:claude|list_sessions");
}
async function stopSession(sessionId) {
  return await invoke("plugin:claude|stop_session", { sessionId });
}
async function recoverSessions() {
  return await invoke("plugin:claude|recover_sessions");
}
async function getMessages(sessionId) {
  return await invoke("plugin:claude|get_messages", { sessionId });
}
async function getMcpTools(workspacePath) {
  return await invoke("plugin:claude|get_mcp_tools", { workspacePath });
}
function onSessionEvent(handler) {
  const unlisten = listen("plugin:claude:session-event", (event) => {
    handler(event.payload);
  });
  return () => {
    unlisten.then((fn) => fn());
  };
}
exports.createSession = createSession;
exports.getMcpTools = getMcpTools;
exports.getMessages = getMessages;
exports.listSessions = listSessions;
exports.onSessionEvent = onSessionEvent;
exports.recoverSessions = recoverSessions;
exports.sendInput = sendInput;
exports.stopSession = stopSession;
//# sourceMappingURL=index.js.map
