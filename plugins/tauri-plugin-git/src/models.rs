use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitRepository {
    pub id: String,
    pub path: String,
    pub current_branch: String,
    pub remotes: Vec<GitRemote>,
    pub status: GitStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: String,
    pub ahead: usize,
    pub behind: usize,
    pub staged: Vec<GitFileChange>,
    pub unstaged: Vec<GitFileChange>,
    pub untracked: Vec<String>,
    pub conflicted: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitFileChange {
    pub path: String,
    pub status: FileStatus,
    pub old_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FileStatus {
    Added,
    Modified,
    Deleted,
    Renamed,
    Copied,
    Unmerged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommit {
    pub hash: String,
    pub short_hash: String,
    pub author: GitAuthor,
    pub committer: GitAuthor,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub parents: Vec<String>,
    pub files: Option<Vec<GitFileChange>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitAuthor {
    pub name: String,
    pub email: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitBranch {
    pub name: String,
    pub is_remote: bool,
    pub is_current: bool,
    pub upstream: Option<String>,
    pub last_commit: String,
    pub ahead: usize,
    pub behind: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitRemote {
    pub name: String,
    pub url: String,
    pub fetch_url: Option<String>,
    pub push_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitTag {
    pub name: String,
    pub target: String,
    pub tagger: Option<GitAuthor>,
    pub message: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitDiff {
    pub old_path: String,
    pub new_path: String,
    pub hunks: Vec<GitDiffHunk>,
    pub stats: GitDiffStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitDiffHunk {
    pub old_start: u32,
    pub old_lines: u32,
    pub new_start: u32,
    pub new_lines: u32,
    pub header: String,
    pub lines: Vec<GitDiffLine>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitDiffLine {
    #[serde(rename = "type")]
    pub line_type: DiffLineType,
    pub content: String,
    pub old_line_number: Option<u32>,
    pub new_line_number: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DiffLineType {
    Add,
    Delete,
    Context,
    Header,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitDiffStats {
    pub additions: usize,
    pub deletions: usize,
    pub files_changed: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStashEntry {
    pub id: String,
    pub message: String,
    pub branch: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitBlame {
    pub lines: Vec<GitBlameLine>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitBlameLine {
    pub commit: String,
    pub author: String,
    pub timestamp: DateTime<Utc>,
    pub line_number: u32,
    pub content: String,
}

// Command options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitOptions {
    pub message: String,
    pub amend: Option<bool>,
    pub author: Option<String>,
    pub signoff: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitFetchOptions {
    pub remote: Option<String>,
    pub prune: Option<bool>,
    pub tags: Option<bool>,
    pub depth: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitPullOptions {
    pub remote: Option<String>,
    pub branch: Option<String>,
    pub rebase: Option<bool>,
    pub fast_forward_only: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitPushOptions {
    pub remote: Option<String>,
    pub branch: Option<String>,
    pub force: Option<bool>,
    pub set_upstream: Option<bool>,
    pub tags: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCheckoutOptions {
    pub branch: Option<String>,
    pub create_branch: Option<bool>,
    pub force: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitMergeOptions {
    pub branch: String,
    pub fast_forward_only: Option<bool>,
    pub no_commit: Option<bool>,
    pub squash: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitResetOptions {
    pub mode: ResetMode,
    pub target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ResetMode {
    Soft,
    Mixed,
    Hard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStashOptions {
    pub message: Option<String>,
    pub include_untracked: Option<bool>,
    pub keep_index: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitLogOptions {
    pub max_count: Option<usize>,
    pub skip: Option<usize>,
    pub since: Option<String>,
    pub until: Option<String>,
    pub author: Option<String>,
    pub grep: Option<String>,
    pub branches: Option<bool>,
    pub tags: Option<bool>,
    pub remotes: Option<bool>,
    pub all: Option<bool>,
    pub oneline: Option<bool>,
    pub graph: Option<bool>,
    pub follow: Option<bool>,
    pub path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitConfig {
    pub user: GitUserConfig,
    pub commit: GitCommitConfig,
    pub pull: GitPullConfig,
    pub push: GitPushConfig,
    pub core: GitCoreConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitUserConfig {
    pub name: Option<String>,
    pub email: Option<String>,
    pub signing_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitConfig {
    pub gpg_sign: Option<bool>,
    pub template: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitPullConfig {
    pub rebase: Option<bool>,
    pub ff: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitPushConfig {
    pub default: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCoreConfig {
    pub editor: Option<String>,
    pub autocrlf: Option<String>,
    pub ignorecase: Option<bool>,
}