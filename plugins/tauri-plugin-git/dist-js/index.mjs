typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
async function gitStatus(repoPath) {
  return await invoke("plugin:git|git_status", { repoPath });
}
async function gitLog(repoPath, options = {}) {
  return await invoke("plugin:git|git_log", { repoPath, options });
}
async function gitStage(repoPath, filePath) {
  return await invoke("plugin:git|git_stage", { repoPath, filePath });
}
async function gitUnstage(repoPath, filePath) {
  return await invoke("plugin:git|git_unstage", { repoPath, filePath });
}
async function gitStageAll(repoPath) {
  return await invoke("plugin:git|git_stage_all", { repoPath });
}
async function gitUnstageAll(repoPath) {
  return await invoke("plugin:git|git_unstage_all", { repoPath });
}
async function gitCommit(repoPath, options) {
  return await invoke("plugin:git|git_commit", { repoPath, options });
}
async function gitDiff(repoPath, cached = false) {
  return await invoke("plugin:git|git_diff", { repoPath, cached });
}
async function gitDiffFile(repoPath, filePath, cached = false) {
  return await invoke("plugin:git|git_diff_file", { repoPath, filePath, cached });
}
async function gitBranches(repoPath) {
  return await invoke("plugin:git|git_branches", { repoPath });
}
async function gitCreateBranch(repoPath, branchName, fromRef) {
  return await invoke("plugin:git|git_create_branch", { repoPath, branchName, fromRef });
}
async function gitCheckout(repoPath, options) {
  return await invoke("plugin:git|git_checkout", { repoPath, options });
}
async function gitDeleteBranch(repoPath, branchName, force = false) {
  return await invoke("plugin:git|git_delete_branch", { repoPath, branchName, force });
}
async function gitMerge(repoPath, options) {
  return await invoke("plugin:git|git_merge", { repoPath, options });
}
async function gitFetch(repoPath, options = {}) {
  return await invoke("plugin:git|git_fetch", { repoPath, options });
}
async function gitPull(repoPath, options = {}) {
  return await invoke("plugin:git|git_pull", { repoPath, options });
}
async function gitPush(repoPath, options = {}) {
  return await invoke("plugin:git|git_push", { repoPath, options });
}
async function gitRemotes(repoPath) {
  return await invoke("plugin:git|git_remotes", { repoPath });
}
async function gitAddRemote(repoPath, name, url) {
  return await invoke("plugin:git|git_add_remote", { repoPath, name, url });
}
async function gitRemoveRemote(repoPath, name) {
  return await invoke("plugin:git|git_remove_remote", { repoPath, name });
}
async function gitStash(repoPath, options = {}) {
  return await invoke("plugin:git|git_stash", { repoPath, options });
}
async function gitStashList(repoPath) {
  return await invoke("plugin:git|git_stash_list", { repoPath });
}
async function gitStashApply(repoPath, stashId) {
  return await invoke("plugin:git|git_stash_apply", { repoPath, stashId });
}
async function gitStashPop(repoPath, stashId) {
  return await invoke("plugin:git|git_stash_pop", { repoPath, stashId });
}
async function gitStashDrop(repoPath, stashId) {
  return await invoke("plugin:git|git_stash_drop", { repoPath, stashId });
}
async function gitReset(repoPath, options) {
  return await invoke("plugin:git|git_reset", { repoPath, options });
}
async function gitRevert(repoPath, commit) {
  return await invoke("plugin:git|git_revert", { repoPath, commit });
}
async function gitCherryPick(repoPath, commit) {
  return await invoke("plugin:git|git_cherry_pick", { repoPath, commit });
}
async function gitTags(repoPath) {
  return await invoke("plugin:git|git_tags", { repoPath });
}
async function gitCreateTag(repoPath, tagName, message) {
  return await invoke("plugin:git|git_create_tag", { repoPath, tagName, message });
}
async function gitDeleteTag(repoPath, tagName) {
  return await invoke("plugin:git|git_delete_tag", { repoPath, tagName });
}
async function gitClone(url, path) {
  return await invoke("plugin:git|git_clone", { url, path });
}
async function gitInit(path) {
  return await invoke("plugin:git|git_init", { path });
}
async function gitConfigGet(repoPath, key) {
  return await invoke("plugin:git|git_config_get", { repoPath, key });
}
async function gitConfigSet(repoPath, key, value) {
  return await invoke("plugin:git|git_config_set", { repoPath, key, value });
}
async function gitBlame(repoPath, filePath) {
  return await invoke("plugin:git|git_blame", { repoPath, filePath });
}
async function gitShowCommit(repoPath, commit) {
  return await invoke("plugin:git|git_show_commit", { repoPath, commit });
}
export {
  gitAddRemote,
  gitBlame,
  gitBranches,
  gitCheckout,
  gitCherryPick,
  gitClone,
  gitCommit,
  gitConfigGet,
  gitConfigSet,
  gitCreateBranch,
  gitCreateTag,
  gitDeleteBranch,
  gitDeleteTag,
  gitDiff,
  gitDiffFile,
  gitFetch,
  gitInit,
  gitLog,
  gitMerge,
  gitPull,
  gitPush,
  gitRemotes,
  gitRemoveRemote,
  gitReset,
  gitRevert,
  gitShowCommit,
  gitStage,
  gitStageAll,
  gitStash,
  gitStashApply,
  gitStashDrop,
  gitStashList,
  gitStashPop,
  gitStatus,
  gitTags,
  gitUnstage,
  gitUnstageAll
};
//# sourceMappingURL=index.mjs.map
