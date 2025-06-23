"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
class StoragePlugin {
  async setItem(options) {
    return invoke("plugin:storage|set_item", { options });
  }
  async getItem(options) {
    return invoke("plugin:storage|get_item", { options });
  }
  async removeItem(options) {
    return invoke("plugin:storage|remove_item", { options });
  }
  async clear(options = { includeEncrypted: false }) {
    return invoke("plugin:storage|clear", { options });
  }
  async listKeys(options = { includeEncrypted: false }) {
    return invoke("plugin:storage|list_keys", { options });
  }
  async setEncryptedItem(options) {
    return invoke("plugin:storage|set_encrypted_item", { options });
  }
  async getEncryptedItem(options) {
    return invoke("plugin:storage|get_encrypted_item", { options });
  }
  async setStoragePath(path) {
    return invoke("plugin:storage|set_storage_path", { path });
  }
  async getStoragePath() {
    return invoke("plugin:storage|get_storage_path");
  }
  async exists(options) {
    return invoke("plugin:storage|exists", { options });
  }
  async getStorageInfo(namespace) {
    return invoke("plugin:storage|get_storage_info", { namespace });
  }
}
const storage = new StoragePlugin();
async function setItem(key, value, namespace, metadata) {
  return storage.setItem({ key, value, namespace, metadata });
}
async function getItem(key, namespace) {
  const item = await storage.getItem({ key, namespace });
  return item.value;
}
async function removeItem(key, namespace) {
  return storage.removeItem({ key, namespace });
}
async function clear(namespace, includeEncrypted = false) {
  return storage.clear({ namespace, includeEncrypted });
}
async function listKeys(namespace, includeEncrypted = false) {
  return storage.listKeys({ namespace, includeEncrypted });
}
async function setEncryptedItem(key, value, password, namespace, metadata) {
  return storage.setEncryptedItem({ key, value, password, namespace, metadata });
}
async function getEncryptedItem(key, password, namespace) {
  return storage.getEncryptedItem({ key, password, namespace });
}
async function setStoragePath(path) {
  return storage.setStoragePath(path);
}
async function getStoragePath() {
  return storage.getStoragePath();
}
async function exists(key, namespace) {
  return storage.exists({ key, namespace });
}
async function getStorageInfo(namespace) {
  return storage.getStorageInfo(namespace);
}
exports.clear = clear;
exports.default = storage;
exports.exists = exists;
exports.getEncryptedItem = getEncryptedItem;
exports.getItem = getItem;
exports.getStorageInfo = getStorageInfo;
exports.getStoragePath = getStoragePath;
exports.listKeys = listKeys;
exports.removeItem = removeItem;
exports.setEncryptedItem = setEncryptedItem;
exports.setItem = setItem;
exports.setStoragePath = setStoragePath;
//# sourceMappingURL=index.js.map
