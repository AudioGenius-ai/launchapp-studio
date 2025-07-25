# tauri-plugin-git

A comprehensive Git integration plugin for Code Pilot Studio v2, providing full version control capabilities through libgit2.

## Overview

This plugin brings powerful Git functionality directly into the IDE, supporting everything from basic operations like status and commit to advanced features like interactive rebasing, cherry-picking, and submodule management. Built on libgit2 for reliability and performance.

## Features

- **Repository Management**: Initialize, clone, and manage Git repositories
- **File Operations**: Stage, unstage, and track file changes
- **Commit History**: View logs, diffs, and blame information
- **Branch Operations**: Create, checkout, merge, and delete branches
- **Remote Operations**: Fetch, pull, push with authentication support
- **Advanced Git**: Stash, cherry-pick, rebase, and submodules
- **Configuration**: Read and write Git config at all levels

## Installation

This plugin is included as part of Code Pilot Studio v2. No separate installation is required.

## Usage

### TypeScript API

```typescript
import { invoke } from '@tauri-apps/api/core';

// Get repository status
const status = await invoke('plugin:git|git_status', {
    repoPath: '/path/to/repo'
});

// Stage files
await invoke('plugin:git|git_stage', {
    repoPath: '/path/to/repo',
    paths: ['src/file1.ts', 'src/file2.ts']
});

// Commit changes
await invoke('plugin:git|git_commit', {
    repoPath: '/path/to/repo',
    message: 'feat: add new feature',
    author: { name: 'John Doe', email: 'john@example.com' }
});

// Create and checkout branch
await invoke('plugin:git|git_create_branch', {
    repoPath: '/path/to/repo',
    branchName: 'feature/new-feature'
});

await invoke('plugin:git|git_checkout', {
    repoPath: '/path/to/repo',
    target: 'feature/new-feature'
});

// Push to remote
await invoke('plugin:git|git_push', {
    repoPath: '/path/to/repo',
    remote: 'origin',
    branch: 'feature/new-feature'
});
```

## Commands Reference

### Repository Operations

#### `git_init`

Initialize a new Git repository.

**Parameters:**

- `path` (string): Directory path to initialize

**Returns:** `void`

#### `git_clone`

Clone a remote repository.

**Parameters:**

- `url` (string): Repository URL
- `path` (string): Destination path
- `auth` (GitAuth, optional): Authentication credentials

**Returns:** `void`

#### `git_status`

Get the current repository status.

**Parameters:**

- `repoPath` (string): Repository path

**Returns:** `GitStatus`

```typescript
interface GitStatus {
    modified: GitFileStatus[];
    staged: GitFileStatus[];
    untracked: string[];
    branch: string;
    upstream?: string;
    ahead: number;
    behind: number;
}
```

### File Operations

#### `git_stage`

Stage files for commit.

**Parameters:**

- `repoPath` (string): Repository path
- `paths` (string[]): File paths to stage

**Returns:** `void`

#### `git_unstage`

Unstage files.

**Parameters:**

- `repoPath` (string): Repository path
- `paths` (string[]): File paths to unstage

**Returns:** `void`

#### `git_discard`

Discard changes in working directory.

**Parameters:**

- `repoPath` (string): Repository path
- `paths` (string[]): File paths to discard

**Returns:** `void`

### Commit Operations

#### `git_commit`

Create a new commit.

**Parameters:**

- `repoPath` (string): Repository path
- `message` (string): Commit message
- `author` (GitAuthor, optional): Author information

**Returns:** `string` (commit hash)

#### `git_log`

Get commit history.

**Parameters:**

- `repoPath` (string): Repository path
- `limit` (number, optional): Maximum number of commits

**Returns:** `GitCommit[]`

#### `git_show`

Show commit details.

**Parameters:**

- `repoPath` (string): Repository path
- `commitHash` (string): Commit SHA

**Returns:** `GitCommit` with diff

### Branch Operations

#### `git_branches`

List all branches.

**Parameters:**

- `repoPath` (string): Repository path

**Returns:** `GitBranch[]`

#### `git_create_branch`

Create a new branch.

**Parameters:**

- `repoPath` (string): Repository path
- `branchName` (string): New branch name
- `checkout` (boolean, optional): Checkout after creation

**Returns:** `void`

#### `git_checkout`

Checkout a branch, tag, or commit.

**Parameters:**

- `repoPath` (string): Repository path
- `target` (string): Branch name, tag, or commit SHA

**Returns:** `void`

#### `git_merge`

Merge a branch into current branch.

**Parameters:**

- `repoPath` (string): Repository path
- `branch` (string): Branch to merge

**Returns:** `void`

#### `git_delete_branch`

Delete a branch.

**Parameters:**

- `repoPath` (string): Repository path
- `branchName` (string): Branch to delete
- `force` (boolean, optional): Force deletion

**Returns:** `void`

### Remote Operations

#### `git_remotes`

List configured remotes.

**Parameters:**

- `repoPath` (string): Repository path

**Returns:** `GitRemote[]`

#### `git_fetch`

Fetch from remote.

**Parameters:**

- `repoPath` (string): Repository path
- `remote` (string, optional): Remote name (default: origin)
- `auth` (GitAuth, optional): Authentication

**Returns:** `void`

#### `git_pull`

Pull changes from remote.

**Parameters:**

- `repoPath` (string): Repository path
- `remote` (string, optional): Remote name
- `branch` (string, optional): Branch name
- `auth` (GitAuth, optional): Authentication

**Returns:** `void`

#### `git_push`

Push changes to remote.

**Parameters:**

- `repoPath` (string): Repository path
- `remote` (string): Remote name
- `branch` (string): Branch name
- `auth` (GitAuth, optional): Authentication
- `force` (boolean, optional): Force push

**Returns:** `void`

### Diff Operations

#### `git_diff`

Get diff of working directory.

**Parameters:**

- `repoPath` (string): Repository path
- `paths` (string[], optional): Specific paths

**Returns:** `GitDiff[]`

#### `git_diff_commits`

Get diff between commits.

**Parameters:**

- `repoPath` (string): Repository path
- `from` (string): From commit SHA
- `to` (string): To commit SHA

**Returns:** `GitDiff[]`

### Stash Operations

#### `git_stash`

Create a new stash.

**Parameters:**

- `repoPath` (string): Repository path
- `message` (string, optional): Stash message

**Returns:** `void`

#### `git_stash_list`

List all stashes.

**Parameters:**

- `repoPath` (string): Repository path

**Returns:** `GitStash[]`

#### `git_stash_apply`

Apply a stash.

**Parameters:**

- `repoPath` (string): Repository path
- `stashIndex` (number): Stash index

**Returns:** `void`

### Advanced Operations

#### `git_cherry_pick`

Cherry-pick a commit.

**Parameters:**

- `repoPath` (string): Repository path
- `commitHash` (string): Commit to cherry-pick

**Returns:** `void`

#### `git_rebase`

Rebase current branch.

**Parameters:**

- `repoPath` (string): Repository path
- `onto` (string): Target branch
- `interactive` (boolean, optional): Interactive rebase

**Returns:** `void`

#### `git_blame`

Get blame information for a file.

**Parameters:**

- `repoPath` (string): Repository path
- `filePath` (string): File to blame

**Returns:** `GitBlame[]`

## Authentication

The plugin supports multiple authentication methods:

```typescript
interface GitAuth {
    type: 'basic' | 'ssh' | 'token';
    username?: string;
    password?: string;
    token?: string;
    sshKey?: string;
    sshPassphrase?: string;
}

// Basic auth
const auth = {
    type: 'basic',
    username: 'user',
    password: 'pass'
};

// Personal access token
const auth = {
    type: 'token',
    token: 'ghp_xxxxxxxxxxxx'
};

// SSH key
const auth = {
    type: 'ssh',
    sshKey: '/path/to/key',
    sshPassphrase: 'passphrase'
};
```

## Error Handling

The plugin provides detailed error information:

```typescript
try {
    await invoke('plugin:git|git_commit', {
        repoPath: '/path/to/repo',
        message: 'commit message'
    });
} catch (error) {
    // Handle specific Git errors
    if (error.includes('nothing to commit')) {
        console.log('No changes to commit');
    } else if (error.includes('merge conflict')) {
        console.log('Resolve conflicts first');
    }
}
```

## Configuration

### Git Config Management

```typescript
// Read config
const config = await invoke('plugin:git|git_config_get', {
    repoPath: '/path/to/repo',
    key: 'user.name'
});

// Write config
await invoke('plugin:git|git_config_set', {
    repoPath: '/path/to/repo',
    key: 'user.email',
    value: 'user@example.com'
});
```

## Performance Considerations

- Large repository operations are performed asynchronously
- File status checks are optimized for performance
- Diff generation uses streaming for large files
- History queries support pagination

## Development

### Building

```bash
cd apps/desktop
pnpm tauri:build
```

### Testing

```bash
cd plugins/tauri-plugin-git
cargo test
```

### Debugging

Enable libgit2 tracing:

```rust
git2::trace_set(git2::TraceLevel::Debug, |level, msg| {
    println!("[git2 {:?}] {}", level, msg);
});
```

## Security

- All repository paths are validated
- SSH keys are never exposed to frontend
- Credentials are handled securely in memory
- No shell command execution

## Troubleshooting

### Repository not found

Ensure the path points to a valid Git repository (contains .git directory).

### Authentication failures

- Check credentials are correct
- For SSH, ensure key has proper permissions (600)
- For HTTPS, use personal access tokens instead of passwords

### Merge conflicts

Use `git_status` to identify conflicted files, resolve manually, then stage resolved files.

## Future Enhancements

- [ ] GPG signing support
- [ ] Partial clone support
- [ ] Worktree management
- [ ] Bundle/unbundle operations
- [ ] Advanced merge strategies
- [ ] Bisect support

## License

This plugin is part of Code Pilot Studio v2 and follows the main project's license.
