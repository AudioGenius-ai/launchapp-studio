use crate::{error::Result, models::*};
use git2::{Delta, DiffLineType as Git2DiffLineType, Oid, Repository, Status, Time};
use chrono::{DateTime, TimeZone, Utc};
use std::path::Path;

pub fn convert_status_to_file_status(status: Status) -> FileStatus {
    if status.contains(Status::INDEX_NEW) || status.contains(Status::WT_NEW) {
        FileStatus::Added
    } else if status.contains(Status::INDEX_DELETED) || status.contains(Status::WT_DELETED) {
        FileStatus::Deleted
    } else if status.contains(Status::INDEX_RENAMED) || status.contains(Status::WT_RENAMED) {
        FileStatus::Renamed
    } else if status.contains(Status::INDEX_MODIFIED) || status.contains(Status::WT_MODIFIED) {
        FileStatus::Modified
    } else if status.contains(Status::CONFLICTED) {
        FileStatus::Unmerged
    } else {
        FileStatus::Modified
    }
}

pub fn convert_delta_to_file_status(delta: Delta) -> FileStatus {
    match delta {
        Delta::Added => FileStatus::Added,
        Delta::Deleted => FileStatus::Deleted,
        Delta::Modified => FileStatus::Modified,
        Delta::Renamed => FileStatus::Renamed,
        Delta::Copied => FileStatus::Copied,
        Delta::Conflicted => FileStatus::Unmerged,
        _ => FileStatus::Modified,
    }
}

pub fn create_file_change(path: String, status: Status) -> GitFileChange {
    GitFileChange {
        path,
        status: convert_status_to_file_status(status),
        old_path: None,
    }
}

pub fn create_file_change_from_delta(delta: &git2::DiffDelta) -> GitFileChange {
    let path = delta.new_file().path()
        .and_then(|p| p.to_str())
        .unwrap_or("")
        .to_string();
    
    let old_path = if delta.status() == Delta::Renamed {
        delta.old_file().path()
            .and_then(|p| p.to_str())
            .map(String::from)
    } else {
        None
    };
    
    GitFileChange {
        path,
        status: convert_delta_to_file_status(delta.status()),
        old_path,
    }
}

pub fn convert_time_to_datetime(time: &Time) -> DateTime<Utc> {
    Utc.timestamp_opt(time.seconds(), 0).unwrap()
}

pub fn convert_author(sig: &git2::Signature) -> Result<GitAuthor> {
    Ok(GitAuthor {
        name: sig.name().unwrap_or("Unknown").to_string(),
        email: sig.email().unwrap_or("unknown@example.com").to_string(),
        timestamp: convert_time_to_datetime(&sig.when()),
    })
}

pub fn convert_commit(commit: &git2::Commit) -> Result<GitCommit> {
    let hash = commit.id().to_string();
    let short_hash = hash.chars().take(7).collect();
    
    Ok(GitCommit {
        hash,
        short_hash,
        author: convert_author(&commit.author())?,
        committer: convert_author(&commit.committer())?,
        message: commit.message().unwrap_or("").to_string(),
        timestamp: convert_time_to_datetime(&commit.time()),
        parents: commit.parent_ids().map(|oid| oid.to_string()).collect(),
        files: None,
    })
}

pub fn convert_diff_line_type(line_type: Git2DiffLineType) -> DiffLineType {
    match line_type {
        Git2DiffLineType::Addition => DiffLineType::Add,
        Git2DiffLineType::Deletion => DiffLineType::Delete,
        Git2DiffLineType::Context | Git2DiffLineType::ContextEOFNL => DiffLineType::Context,
        Git2DiffLineType::FileHeader | Git2DiffLineType::HunkHeader => DiffLineType::Header,
        _ => DiffLineType::Context,
    }
}

pub fn get_repo_root(path: &Path) -> Result<String> {
    let repo = Repository::discover(path)?;
    let workdir = repo.workdir()
        .ok_or_else(|| anyhow::anyhow!("Repository has no working directory"))?;
    Ok(workdir.to_string_lossy().to_string())
}

pub fn is_repo_clean(repo: &Repository) -> Result<bool> {
    let mut status_opts = git2::StatusOptions::new();
    status_opts
        .include_untracked(true)
        .include_ignored(false);
    
    let statuses = repo.statuses(Some(&mut status_opts))?;
    Ok(statuses.is_empty())
}

pub fn get_current_branch_name(repo: &Repository) -> Result<String> {
    let head = repo.head()?;
    
    if let Some(name) = head.shorthand() {
        Ok(name.to_string())
    } else if repo.head_detached()? {
        let oid = head.target().ok_or_else(|| anyhow::anyhow!("No commit found"))?;
        Ok(format!("(detached HEAD at {})", &oid.to_string()[..7]))
    } else {
        Ok("HEAD".to_string())
    }
}

pub fn get_ahead_behind(repo: &Repository, local_oid: Oid, upstream_oid: Oid) -> Result<(usize, usize)> {
    let (ahead, behind) = repo.graph_ahead_behind(local_oid, upstream_oid)?;
    Ok((ahead, behind))
}

pub fn convert_reset_mode(mode: &ResetMode) -> git2::ResetType {
    match mode {
        ResetMode::Soft => git2::ResetType::Soft,
        ResetMode::Mixed => git2::ResetType::Mixed,
        ResetMode::Hard => git2::ResetType::Hard,
    }
}

pub fn find_repository(path: &str) -> Result<Repository> {
    Repository::discover(path)
        .or_else(|_| Repository::open(path))
        .map_err(|e| e.into())
}