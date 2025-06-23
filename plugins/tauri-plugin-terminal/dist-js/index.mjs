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
async function createTerminal(options = {}) {
  return await invoke("plugin:terminal|create_terminal", { options });
}
async function writeToTerminal(terminalId, data) {
  return await invoke("plugin:terminal|write_to_terminal", { terminalId, data });
}
async function resizeTerminal(terminalId, cols, rows) {
  return await invoke("plugin:terminal|resize_terminal", { terminalId, cols, rows });
}
async function killTerminal(terminalId) {
  return await invoke("plugin:terminal|kill_terminal", { terminalId });
}
async function handleTerminalCommand(command) {
  return await invoke("plugin:terminal|handle_terminal_command", { command });
}
async function getTerminal(terminalId) {
  return await invoke("plugin:terminal|get_terminal", { terminalId });
}
async function listTerminals() {
  return await invoke("plugin:terminal|list_terminals");
}
async function getAvailableShells() {
  return await invoke("plugin:terminal|get_available_shells");
}
async function getDefaultShell() {
  return await invoke("plugin:terminal|get_default_shell");
}
function onTerminalData(handler) {
  const unlisten = listen("plugin:terminal:data", (event) => {
    handler(event.payload);
  });
  return () => {
    unlisten.then((fn) => fn());
  };
}
export {
  createTerminal,
  getAvailableShells,
  getDefaultShell,
  getTerminal,
  handleTerminalCommand,
  killTerminal,
  listTerminals,
  onTerminalData,
  resizeTerminal,
  writeToTerminal
};
//# sourceMappingURL=index.mjs.map
