use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use std::sync::Arc;

pub mod error;
pub mod models;
pub mod utils;
pub mod repository;
pub mod commands;

pub use error::{Error, Result};
pub use models::*;
use repository::GitManager;

pub struct Git<R: Runtime> {
    #[allow(dead_code)]
    app: tauri::AppHandle<R>,
    manager: Arc<GitManager>,
}

impl<R: Runtime> Git<R> {
    pub fn status(&self, repo_path: &str) -> Result<GitStatus> {
        self.manager.status(repo_path)
    }

    pub fn get_log(&self, repo_path: &str, options: GitLogOptions) -> Result<Vec<GitCommit>> {
        self.manager.get_log(repo_path, options)
    }

    pub fn commit(&self, repo_path: &str, options: GitCommitOptions) -> Result<String> {
        self.manager.commit(repo_path, options)
    }

    pub fn stage_file(&self, repo_path: &str, file_path: &str) -> Result<()> {
        self.manager.stage_file(repo_path, file_path)
    }

    pub fn unstage_file(&self, repo_path: &str, file_path: &str) -> Result<()> {
        self.manager.unstage_file(repo_path, file_path)
    }

    pub fn stage_all(&self, repo_path: &str) -> Result<()> {
        self.manager.stage_all(repo_path)
    }

    pub fn unstage_all(&self, repo_path: &str) -> Result<()> {
        self.manager.unstage_all(repo_path)
    }

    pub fn get_branches(&self, repo_path: &str) -> Result<Vec<GitBranch>> {
        self.manager.get_branches(repo_path)
    }

    pub fn create_branch(&self, repo_path: &str, branch_name: &str, from_ref: Option<&str>) -> Result<()> {
        self.manager.create_branch(repo_path, branch_name, from_ref)
    }

    pub fn checkout(&self, repo_path: &str, options: GitCheckoutOptions) -> Result<()> {
        self.manager.checkout(repo_path, options)
    }

    pub fn get_remotes(&self, repo_path: &str) -> Result<Vec<GitRemote>> {
        self.manager.get_remotes(repo_path)
    }
}

/// Extension trait to access the git API
pub trait GitExt<R: Runtime> {
    fn git(&self) -> &Git<R>;
}

impl<R: Runtime, T: Manager<R>> GitExt<R> for T {
    fn git(&self) -> &Git<R> {
        self.state::<Git<R>>().inner()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("git")
        .invoke_handler(tauri::generate_handler![
            commands::git_status,
            commands::git_log,
            commands::git_commit,
            commands::git_stage,
            commands::git_unstage,
            commands::git_stage_all,
            commands::git_unstage_all,
            commands::git_diff,
            commands::git_diff_file,
            commands::git_branches,
            commands::git_create_branch,
            commands::git_checkout,
            commands::git_delete_branch,
            commands::git_merge,
            commands::git_fetch,
            commands::git_pull,
            commands::git_push,
            commands::git_remotes,
            commands::git_add_remote,
            commands::git_remove_remote,
            commands::git_stash,
            commands::git_stash_list,
            commands::git_stash_apply,
            commands::git_stash_pop,
            commands::git_stash_drop,
            commands::git_reset,
            commands::git_revert,
            commands::git_cherry_pick,
            commands::git_tags,
            commands::git_create_tag,
            commands::git_delete_tag,
            commands::git_clone,
            commands::git_init,
            commands::git_config_get,
            commands::git_config_set,
            commands::git_blame,
            commands::git_show_commit,
        ])
        .setup(move |app, _api| {
            let manager = Arc::new(GitManager::new());
            
            app.manage(Git {
                app: app.clone(),
                manager,
            });
            
            Ok(())
        })
        .build()
}