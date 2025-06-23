import { invoke } from '@tauri-apps/api/core';

// Note: Git types are available from @code-pilot/feature-git package
// This plugin focuses on providing the raw API functions

// Status and info
export async function gitStatus(repoPath: string): Promise<any> {
  return await invoke('plugin:git|git_status', { repoPath });
}

export async function gitLog(repoPath: string, options: any = {}): Promise<any[]> {
  return await invoke('plugin:git|git_log', { repoPath, options });
}

// Staging
export async function gitStage(repoPath: string, filePath: string): Promise<void> {
  return await invoke('plugin:git|git_stage', { repoPath, filePath });
}

export async function gitUnstage(repoPath: string, filePath: string): Promise<void> {
  return await invoke('plugin:git|git_unstage', { repoPath, filePath });
}

export async function gitStageAll(repoPath: string): Promise<void> {
  return await invoke('plugin:git|git_stage_all', { repoPath });
}

export async function gitUnstageAll(repoPath: string): Promise<void> {
  return await invoke('plugin:git|git_unstage_all', { repoPath });
}

// Commits
export async function gitCommit(repoPath: string, options: any): Promise<string> {
  return await invoke('plugin:git|git_commit', { repoPath, options });
}

// Diffs
export async function gitDiff(repoPath: string, cached: boolean = false): Promise<any[]> {
  return await invoke('plugin:git|git_diff', { repoPath, cached });
}

export async function gitDiffFile(repoPath: string, filePath: string, cached: boolean = false): Promise<any> {
  return await invoke('plugin:git|git_diff_file', { repoPath, filePath, cached });
}

// Branches
export async function gitBranches(repoPath: string): Promise<any[]> {
  return await invoke('plugin:git|git_branches', { repoPath });
}

export async function gitCreateBranch(repoPath: string, branchName: string, fromRef?: string): Promise<void> {
  return await invoke('plugin:git|git_create_branch', { repoPath, branchName, fromRef });
}

export async function gitCheckout(repoPath: string, options: any): Promise<void> {
  return await invoke('plugin:git|git_checkout', { repoPath, options });
}

export async function gitDeleteBranch(repoPath: string, branchName: string, force: boolean = false): Promise<void> {
  return await invoke('plugin:git|git_delete_branch', { repoPath, branchName, force });
}

export async function gitMerge(repoPath: string, options: any): Promise<void> {
  return await invoke('plugin:git|git_merge', { repoPath, options });
}

// Remote operations
export async function gitFetch(repoPath: string, options: any = {}): Promise<void> {
  return await invoke('plugin:git|git_fetch', { repoPath, options });
}

export async function gitPull(repoPath: string, options: any = {}): Promise<void> {
  return await invoke('plugin:git|git_pull', { repoPath, options });
}

export async function gitPush(repoPath: string, options: any = {}): Promise<void> {
  return await invoke('plugin:git|git_push', { repoPath, options });
}

// Remotes
export async function gitRemotes(repoPath: string): Promise<any[]> {
  return await invoke('plugin:git|git_remotes', { repoPath });
}

export async function gitAddRemote(repoPath: string, name: string, url: string): Promise<void> {
  return await invoke('plugin:git|git_add_remote', { repoPath, name, url });
}

export async function gitRemoveRemote(repoPath: string, name: string): Promise<void> {
  return await invoke('plugin:git|git_remove_remote', { repoPath, name });
}

// Stash
export async function gitStash(repoPath: string, options: any = {}): Promise<void> {
  return await invoke('plugin:git|git_stash', { repoPath, options });
}

export async function gitStashList(repoPath: string): Promise<any[]> {
  return await invoke('plugin:git|git_stash_list', { repoPath });
}

export async function gitStashApply(repoPath: string, stashId: string): Promise<void> {
  return await invoke('plugin:git|git_stash_apply', { repoPath, stashId });
}

export async function gitStashPop(repoPath: string, stashId: string): Promise<void> {
  return await invoke('plugin:git|git_stash_pop', { repoPath, stashId });
}

export async function gitStashDrop(repoPath: string, stashId: string): Promise<void> {
  return await invoke('plugin:git|git_stash_drop', { repoPath, stashId });
}

// Reset/Revert
export async function gitReset(repoPath: string, options: any): Promise<void> {
  return await invoke('plugin:git|git_reset', { repoPath, options });
}

export async function gitRevert(repoPath: string, commit: string): Promise<void> {
  return await invoke('plugin:git|git_revert', { repoPath, commit });
}

export async function gitCherryPick(repoPath: string, commit: string): Promise<void> {
  return await invoke('plugin:git|git_cherry_pick', { repoPath, commit });
}

// Tags
export async function gitTags(repoPath: string): Promise<any[]> {
  return await invoke('plugin:git|git_tags', { repoPath });
}

export async function gitCreateTag(repoPath: string, tagName: string, message?: string): Promise<void> {
  return await invoke('plugin:git|git_create_tag', { repoPath, tagName, message });
}

export async function gitDeleteTag(repoPath: string, tagName: string): Promise<void> {
  return await invoke('plugin:git|git_delete_tag', { repoPath, tagName });
}

// Repository
export async function gitClone(url: string, path: string): Promise<void> {
  return await invoke('plugin:git|git_clone', { url, path });
}

export async function gitInit(path: string): Promise<void> {
  return await invoke('plugin:git|git_init', { path });
}

// Config
export async function gitConfigGet(repoPath: string, key: string): Promise<string> {
  return await invoke('plugin:git|git_config_get', { repoPath, key });
}

export async function gitConfigSet(repoPath: string, key: string, value: string): Promise<void> {
  return await invoke('plugin:git|git_config_set', { repoPath, key, value });
}

// Blame
export async function gitBlame(repoPath: string, filePath: string): Promise<any> {
  return await invoke('plugin:git|git_blame', { repoPath, filePath });
}

export async function gitShowCommit(repoPath: string, commit: string): Promise<any> {
  return await invoke('plugin:git|git_show_commit', { repoPath, commit });
}