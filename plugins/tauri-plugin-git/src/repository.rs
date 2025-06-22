use crate::{error::Result, models::*, utils::*};
use git2::{
    BranchType, IndexAddOption, Repository, Signature, StatusOptions
};
use std::path::Path;

pub struct GitManager;

impl GitManager {
    pub fn new() -> Self {
        Self
    }
    
    fn get_repo(&self, path: &str) -> Result<Repository> {
        find_repository(path)
    }
    
    pub fn status(&self, repo_path: &str) -> Result<GitStatus> {
        let repo = self.get_repo(repo_path)?;
        let mut status_opts = StatusOptions::new();
        status_opts
            .include_untracked(true)
            .include_ignored(false)
            .include_unreadable(false);
        
        let statuses = repo.statuses(Some(&mut status_opts))?;
        
        let mut staged = Vec::new();
        let mut unstaged = Vec::new();
        let mut untracked = Vec::new();
        let mut conflicted = Vec::new();
        
        for entry in statuses.iter() {
            let status = entry.status();
            let path = entry.path().unwrap_or("").to_string();
            
            if status.is_conflicted() {
                conflicted.push(path.clone());
            }
            
            if status.is_index_new() || status.is_index_modified() || 
               status.is_index_deleted() || status.is_index_renamed() {
                staged.push(create_file_change(path.clone(), status));
            }
            
            if status.is_wt_modified() || status.is_wt_deleted() {
                unstaged.push(create_file_change(path.clone(), status));
            }
            
            if status.is_wt_new() && !status.is_ignored() {
                untracked.push(path);
            }
        }
        
        let branch = get_current_branch_name(&repo)?;
        let (ahead, behind) = self.get_branch_ahead_behind(&repo, &branch)?;
        
        Ok(GitStatus {
            branch,
            ahead,
            behind,
            staged,
            unstaged,
            untracked,
            conflicted,
        })
    }
    
    fn get_branch_ahead_behind(&self, repo: &Repository, branch_name: &str) -> Result<(usize, usize)> {
        let branch = repo.find_branch(branch_name, BranchType::Local)
            .or_else(|_| repo.find_branch(branch_name, BranchType::Remote))?;
        
        if let Ok(upstream) = branch.upstream() {
            let local_oid = branch.get().target()
                .ok_or_else(|| anyhow::anyhow!("Local branch has no target"))?;
            let upstream_oid = upstream.get().target()
                .ok_or_else(|| anyhow::anyhow!("Upstream branch has no target"))?;
            
            get_ahead_behind(repo, local_oid, upstream_oid)
        } else {
            Ok((0, 0))
        }
    }
    
    pub fn stage_file(&self, repo_path: &str, file_path: &str) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        let mut index = repo.index()?;
        index.add_path(Path::new(file_path))?;
        index.write()?;
        Ok(())
    }
    
    pub fn unstage_file(&self, repo_path: &str, file_path: &str) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        let mut index = repo.index()?;
        
        if let Ok(head) = repo.head() {
            let tree = head.peel_to_tree()?;
            repo.reset_default(Some(&tree.into_object()), &[file_path])?;
        } else {
            // If no HEAD, just remove from index
            index.remove_path(Path::new(file_path))?;
            index.write()?;
        }
        
        Ok(())
    }
    
    pub fn stage_all(&self, repo_path: &str) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        let mut index = repo.index()?;
        index.add_all(&["."], IndexAddOption::DEFAULT, None)?;
        index.write()?;
        Ok(())
    }
    
    pub fn unstage_all(&self, repo_path: &str) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        
        if let Ok(head) = repo.head() {
            let tree = head.peel_to_tree()?;
            repo.reset_default(Some(&tree.into_object()), &["."])?;
        } else {
            // If no HEAD, clear the index
            let mut index = repo.index()?;
            index.clear()?;
            index.write()?;
        }
        
        Ok(())
    }
    
    pub fn commit(&self, repo_path: &str, options: GitCommitOptions) -> Result<String> {
        let repo = self.get_repo(repo_path)?;
        let mut index = repo.index()?;
        let oid = index.write_tree()?;
        let tree = repo.find_tree(oid)?;
        
        let signature = if let Some(author) = options.author {
            // Parse author in format "Name <email>"
            let parts: Vec<&str> = author.split('<').collect();
            if parts.len() == 2 {
                let name = parts[0].trim();
                let email = parts[1].trim_end_matches('>').trim();
                Signature::now(name, email)?
            } else {
                repo.signature()?
            }
        } else {
            repo.signature()?
        };
        
        let parent_commit = if options.amend.unwrap_or(false) {
            let head = repo.head()?.peel_to_commit()?;
            head.parent(0).ok()
        } else {
            repo.head().ok().and_then(|h| h.peel_to_commit().ok())
        };
        
        let parents = if let Some(parent) = &parent_commit {
            vec![parent]
        } else {
            vec![]
        };
        
        let commit_oid = repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            &options.message,
            &tree,
            &parents,
        )?;
        
        Ok(commit_oid.to_string())
    }
    
    pub fn get_branches(&self, repo_path: &str) -> Result<Vec<GitBranch>> {
        let repo = self.get_repo(repo_path)?;
        let mut branches = Vec::new();
        
        // Local branches
        for branch in repo.branches(Some(BranchType::Local))? {
            let (branch, _) = branch?;
            let name = branch.name()?.unwrap_or("").to_string();
            let is_current = branch.is_head();
            
            let last_commit = branch.get().peel_to_commit()?.id().to_string();
            let (ahead, behind) = if let Ok(upstream) = branch.upstream() {
                let local_oid = branch.get().target().unwrap();
                let upstream_oid = upstream.get().target().unwrap();
                get_ahead_behind(&repo, local_oid, upstream_oid)?
            } else {
                (0, 0)
            };
            
            branches.push(GitBranch {
                name: name.clone(),
                is_remote: false,
                is_current,
                upstream: branch.upstream().ok()
                    .and_then(|u| u.name().ok().flatten().map(String::from)),
                last_commit,
                ahead,
                behind,
            });
        }
        
        // Remote branches
        for branch in repo.branches(Some(BranchType::Remote))? {
            let (branch, _) = branch?;
            let name = branch.name()?.unwrap_or("").to_string();
            let last_commit = branch.get().peel_to_commit()?.id().to_string();
            
            branches.push(GitBranch {
                name,
                is_remote: true,
                is_current: false,
                upstream: None,
                last_commit,
                ahead: 0,
                behind: 0,
            });
        }
        
        Ok(branches)
    }
    
    pub fn create_branch(&self, repo_path: &str, branch_name: &str, from_ref: Option<&str>) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        
        let target = if let Some(ref_name) = from_ref {
            repo.revparse_single(ref_name)?.peel_to_commit()?
        } else {
            repo.head()?.peel_to_commit()?
        };
        
        repo.branch(branch_name, &target, false)?;
        Ok(())
    }
    
    pub fn checkout(&self, repo_path: &str, options: GitCheckoutOptions) -> Result<()> {
        let repo = self.get_repo(repo_path)?;
        
        if let Some(branch_name) = options.branch {
            if options.create_branch.unwrap_or(false) {
                self.create_branch(repo_path, &branch_name, None)?;
            }
            
            let obj = repo.revparse_single(&format!("refs/heads/{}", branch_name))?;
            repo.checkout_tree(&obj, None)?;
            repo.set_head(&format!("refs/heads/{}", branch_name))?;
        }
        
        Ok(())
    }
    
    pub fn get_remotes(&self, repo_path: &str) -> Result<Vec<GitRemote>> {
        let repo = self.get_repo(repo_path)?;
        let mut remotes = Vec::new();
        
        for remote_name in repo.remotes()?.iter() {
            if let Some(name) = remote_name {
                let remote = repo.find_remote(name)?;
                
                remotes.push(GitRemote {
                    name: name.to_string(),
                    url: remote.url().unwrap_or("").to_string(),
                    fetch_url: remote.url().map(String::from),
                    push_url: remote.pushurl().map(String::from),
                });
            }
        }
        
        Ok(remotes)
    }
    
    pub fn get_log(&self, repo_path: &str, options: GitLogOptions) -> Result<Vec<GitCommit>> {
        let repo = self.get_repo(repo_path)?;
        let mut revwalk = repo.revwalk()?;
        
        // Set starting point
        if options.all.unwrap_or(false) {
            revwalk.push_glob("refs/*")?;
        } else {
            revwalk.push_head()?;
        }
        
        // Apply filters
        let mut commits = Vec::new();
        let skip = options.skip.unwrap_or(0);
        let max_count = options.max_count.unwrap_or(100);
        
        for (idx, oid) in revwalk.enumerate() {
            if idx < skip {
                continue;
            }
            
            if commits.len() >= max_count {
                break;
            }
            
            let oid = oid?;
            let commit = repo.find_commit(oid)?;
            
            // Apply filters
            if let Some(author) = &options.author {
                if !commit.author().name().unwrap_or("").contains(author) &&
                   !commit.author().email().unwrap_or("").contains(author) {
                    continue;
                }
            }
            
            if let Some(grep) = &options.grep {
                if !commit.message().unwrap_or("").contains(grep) {
                    continue;
                }
            }
            
            commits.push(convert_commit(&commit)?);
        }
        
        Ok(commits)
    }
}

impl Default for GitManager {
    fn default() -> Self {
        Self::new()
    }
}