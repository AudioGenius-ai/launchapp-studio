import { invoke } from '@tauri-apps/api/core';
// Status and info
export async function gitStatus(repoPath) {
    return await invoke('plugin:git|git_status', { repoPath });
}
export async function gitLog(repoPath, options = {}) {
    return await invoke('plugin:git|git_log', { repoPath, options });
}
// Staging
export async function gitStage(repoPath, filePath) {
    return await invoke('plugin:git|git_stage', { repoPath, filePath });
}
export async function gitUnstage(repoPath, filePath) {
    return await invoke('plugin:git|git_unstage', { repoPath, filePath });
}
export async function gitStageAll(repoPath) {
    return await invoke('plugin:git|git_stage_all', { repoPath });
}
export async function gitUnstageAll(repoPath) {
    return await invoke('plugin:git|git_unstage_all', { repoPath });
}
// Commits
export async function gitCommit(repoPath, options) {
    return await invoke('plugin:git|git_commit', { repoPath, options });
}
// Diffs
export async function gitDiff(repoPath, cached = false) {
    return await invoke('plugin:git|git_diff', { repoPath, cached });
}
export async function gitDiffFile(repoPath, filePath, cached = false) {
    return await invoke('plugin:git|git_diff_file', { repoPath, filePath, cached });
}
// Branches
export async function gitBranches(repoPath) {
    return await invoke('plugin:git|git_branches', { repoPath });
}
export async function gitCreateBranch(repoPath, branchName, fromRef) {
    return await invoke('plugin:git|git_create_branch', { repoPath, branchName, fromRef });
}
export async function gitCheckout(repoPath, options) {
    return await invoke('plugin:git|git_checkout', { repoPath, options });
}
export async function gitDeleteBranch(repoPath, branchName, force = false) {
    return await invoke('plugin:git|git_delete_branch', { repoPath, branchName, force });
}
export async function gitMerge(repoPath, options) {
    return await invoke('plugin:git|git_merge', { repoPath, options });
}
// Remote operations
export async function gitFetch(repoPath, options = {}) {
    return await invoke('plugin:git|git_fetch', { repoPath, options });
}
export async function gitPull(repoPath, options = {}) {
    return await invoke('plugin:git|git_pull', { repoPath, options });
}
export async function gitPush(repoPath, options = {}) {
    return await invoke('plugin:git|git_push', { repoPath, options });
}
// Remotes
export async function gitRemotes(repoPath) {
    return await invoke('plugin:git|git_remotes', { repoPath });
}
export async function gitAddRemote(repoPath, name, url) {
    return await invoke('plugin:git|git_add_remote', { repoPath, name, url });
}
export async function gitRemoveRemote(repoPath, name) {
    return await invoke('plugin:git|git_remove_remote', { repoPath, name });
}
// Stash
export async function gitStash(repoPath, options = {}) {
    return await invoke('plugin:git|git_stash', { repoPath, options });
}
export async function gitStashList(repoPath) {
    return await invoke('plugin:git|git_stash_list', { repoPath });
}
export async function gitStashApply(repoPath, stashId) {
    return await invoke('plugin:git|git_stash_apply', { repoPath, stashId });
}
export async function gitStashPop(repoPath, stashId) {
    return await invoke('plugin:git|git_stash_pop', { repoPath, stashId });
}
export async function gitStashDrop(repoPath, stashId) {
    return await invoke('plugin:git|git_stash_drop', { repoPath, stashId });
}
// Reset/Revert
export async function gitReset(repoPath, options) {
    return await invoke('plugin:git|git_reset', { repoPath, options });
}
export async function gitRevert(repoPath, commit) {
    return await invoke('plugin:git|git_revert', { repoPath, commit });
}
export async function gitCherryPick(repoPath, commit) {
    return await invoke('plugin:git|git_cherry_pick', { repoPath, commit });
}
// Tags
export async function gitTags(repoPath) {
    return await invoke('plugin:git|git_tags', { repoPath });
}
export async function gitCreateTag(repoPath, tagName, message) {
    return await invoke('plugin:git|git_create_tag', { repoPath, tagName, message });
}
export async function gitDeleteTag(repoPath, tagName) {
    return await invoke('plugin:git|git_delete_tag', { repoPath, tagName });
}
// Repository
export async function gitClone(url, path) {
    return await invoke('plugin:git|git_clone', { url, path });
}
export async function gitInit(path) {
    return await invoke('plugin:git|git_init', { path });
}
// Config
export async function gitConfigGet(repoPath, key) {
    return await invoke('plugin:git|git_config_get', { repoPath, key });
}
export async function gitConfigSet(repoPath, key, value) {
    return await invoke('plugin:git|git_config_set', { repoPath, key, value });
}
// Blame
export async function gitBlame(repoPath, filePath) {
    return await invoke('plugin:git|git_blame', { repoPath, filePath });
}
export async function gitShowCommit(repoPath, commit) {
    return await invoke('plugin:git|git_show_commit', { repoPath, commit });
}
