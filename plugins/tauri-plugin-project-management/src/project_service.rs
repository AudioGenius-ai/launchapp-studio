use crate::error::{validate_project_key, ProjectManagementError, Result};
use crate::models::*;
use crate::storage_manager::StorageManager;
use chrono::Utc;
use std::sync::Arc;
use tauri::AppHandle;

pub struct ProjectService {
    storage: Arc<StorageManager>,
}

impl ProjectService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            storage: Arc::new(StorageManager::new(app_handle)),
        }
    }

    pub async fn create_project(&self, request: CreateProjectRequest) -> Result<Project> {
        // Validate project key
        validate_project_key(&request.key)?;

        // Check if project key already exists
        if self.project_key_exists(&request.key).await? {
            return Err(ProjectManagementError::ProjectKeyExists {
                key: request.key,
            });
        }

        // Create project
        let project = Project::new(
            request.name,
            request.key,
            request.description,
            request.owner,
        );

        // Save to storage
        self.storage.create_project(&project).await?;

        Ok(project)
    }

    pub async fn get_project(&self, project_id: &str) -> Result<Project> {
        self.storage.load_project(project_id).await
    }

    pub async fn update_project(&self, project_id: &str, request: UpdateProjectRequest) -> Result<Project> {
        let mut project = self.storage.load_project(project_id).await?;

        if let Some(name) = request.name {
            project.name = name;
        }

        if let Some(description) = request.description {
            project.description = description;
        }

        if let Some(settings) = request.settings {
            project.settings = settings;
        }

        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(project)
    }

    pub async fn delete_project(&self, project_id: &str) -> Result<bool> {
        let _project = self.storage.load_project(project_id).await?;

        let tasks = self.storage.list_tasks(project_id).await?;
        let active_tasks = tasks.iter().filter(|t| t.status != "done").count();

        if active_tasks > 0 {
            return Err(ProjectManagementError::ProjectHasActiveTasks);
        }

        self.storage.delete_project(project_id).await?;

        Ok(true)
    }

    pub async fn list_projects(&self) -> Result<Vec<Project>> {
        self.storage.list_projects().await
    }

    pub async fn add_project_member(&self, project_id: &str, user_id: String, role: ProjectRole) -> Result<bool> {
        let mut project = self.storage.load_project(project_id).await?;

        if project.members.iter().any(|m| m.user_id == user_id) {
            return Ok(false);
        }

        let member = ProjectMember {
            user_id,
            role,
            joined_at: Utc::now(),
        };

        project.members.push(member);
        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(true)
    }

    pub async fn remove_project_member(&self, project_id: &str, user_id: &str) -> Result<bool> {
        let mut project = self.storage.load_project(project_id).await?;

        if project.owner == user_id {
            return Err(ProjectManagementError::ValidationError {
                field: "user_id".to_string(),
                message: "Cannot remove project owner".to_string(),
            });
        }

        let initial_len = project.members.len();
        project.members.retain(|m| m.user_id != user_id);

        if project.members.len() == initial_len {
            return Ok(false);
        }

        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(true)
    }

    pub async fn get_project_settings(&self, project_id: &str) -> Result<ProjectSettings> {
        let project = self.storage.load_project(project_id).await?;
        Ok(project.settings)
    }

    pub async fn update_project_settings(&self, project_id: &str, settings: ProjectSettings) -> Result<ProjectSettings> {
        let mut project = self.storage.load_project(project_id).await?;
        
        project.settings = settings;
        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(project.settings)
    }

    pub async fn get_project_statistics(&self, project_id: &str) -> Result<ProjectStatistics> {
        self.storage.get_project_statistics(project_id).await
    }

    async fn project_key_exists(&self, key: &str) -> Result<bool> {
        let projects = self.storage.list_projects().await?;
        Ok(projects.iter().any(|p| p.key == key))
    }

    pub async fn create_sprint(&self, project_id: &str, request: CreateSprintRequest) -> Result<Sprint> {
        let mut project = self.storage.load_project(project_id).await?;

        if request.end_date <= request.start_date {
            return Err(ProjectManagementError::ValidationError {
                field: "end_date".to_string(),
                message: "End date must be after start date".to_string(),
            });
        }

        let sprint = Sprint::new(
            project_id.to_string(),
            request.name,
            request.start_date,
            request.end_date,
            request.goal,
        );

        project.sprints.push(sprint.clone());
        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(sprint)
    }

    pub async fn get_sprint(&self, project_id: &str, sprint_id: &str) -> Result<Sprint> {
        let project = self.storage.load_project(project_id).await?;
        
        project.sprints
            .into_iter()
            .find(|s| s.id == sprint_id)
            .ok_or(ProjectManagementError::SprintNotFound {
                id: sprint_id.to_string(),
            })
    }

    pub async fn update_sprint(&self, project_id: &str, sprint_id: &str, request: UpdateSprintRequest) -> Result<Sprint> {
        let mut project = self.storage.load_project(project_id).await?;

        let sprint = project.sprints
            .iter_mut()
            .find(|s| s.id == sprint_id)
            .ok_or(ProjectManagementError::SprintNotFound {
                id: sprint_id.to_string(),
            })?;

        if let Some(name) = request.name {
            sprint.name = name;
        }

        if let Some(start_date) = request.start_date {
            sprint.start_date = start_date;
        }

        if let Some(end_date) = request.end_date {
            sprint.end_date = end_date;
        }

        if let Some(goal) = request.goal {
            sprint.goal = goal;
        }

        if let Some(status) = request.status {
            sprint.status = status;
        }

        if sprint.end_date <= sprint.start_date {
            return Err(ProjectManagementError::ValidationError {
                field: "dates".to_string(),
                message: "End date must be after start date".to_string(),
            });
        }

        sprint.updated_at = Utc::now();
        project.updated_at = Utc::now();

        let updated_sprint = sprint.clone();

        self.storage.save_project(&project).await?;

        Ok(updated_sprint)
    }

    pub async fn delete_sprint(&self, project_id: &str, sprint_id: &str) -> Result<bool> {
        let mut project = self.storage.load_project(project_id).await?;

        let tasks = self.storage.list_tasks(project_id).await?;
        let sprint_tasks = tasks.iter().filter(|t| t.sprint_id.as_deref() == Some(sprint_id)).count();

        if sprint_tasks > 0 {
            return Err(ProjectManagementError::SprintHasAssignedTasks);
        }

        let initial_len = project.sprints.len();
        project.sprints.retain(|s| s.id != sprint_id);

        if project.sprints.len() == initial_len {
            return Ok(false);
        }

        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(true)
    }

    pub async fn list_sprints(&self, project_id: &str) -> Result<Vec<Sprint>> {
        let project = self.storage.load_project(project_id).await?;
        Ok(project.sprints)
    }

    pub async fn start_sprint(&self, project_id: &str, sprint_id: &str) -> Result<bool> {
        let mut project = self.storage.load_project(project_id).await?;

        if project.sprints.iter().any(|s| matches!(s.status, SprintStatus::Active)) {
            return Err(ProjectManagementError::ValidationError {
                field: "sprint".to_string(),
                message: "Cannot start sprint: another sprint is already active".to_string(),
            });
        }

        let sprint = project.sprints
            .iter_mut()
            .find(|s| s.id == sprint_id)
            .ok_or(ProjectManagementError::SprintNotFound {
                id: sprint_id.to_string(),
            })?;

        match sprint.status {
            SprintStatus::Active => return Err(ProjectManagementError::SprintAlreadyActive),
            SprintStatus::Completed => return Err(ProjectManagementError::SprintAlreadyCompleted),
            SprintStatus::Cancelled => return Err(ProjectManagementError::ValidationError {
                field: "status".to_string(),
                message: "Cannot start cancelled sprint".to_string(),
            }),
            SprintStatus::Planned => {
                sprint.status = SprintStatus::Active;
                sprint.updated_at = Utc::now();
            }
        }

        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(true)
    }

    pub async fn complete_sprint(&self, project_id: &str, sprint_id: &str) -> Result<bool> {
        let mut project = self.storage.load_project(project_id).await?;

        let sprint = project.sprints
            .iter_mut()
            .find(|s| s.id == sprint_id)
            .ok_or(ProjectManagementError::SprintNotFound {
                id: sprint_id.to_string(),
            })?;

        match sprint.status {
            SprintStatus::Completed => return Err(ProjectManagementError::SprintAlreadyCompleted),
            SprintStatus::Active => {
                sprint.status = SprintStatus::Completed;
                sprint.updated_at = Utc::now();
            }
            _ => return Err(ProjectManagementError::ValidationError {
                field: "status".to_string(),
                message: "Can only complete active sprints".to_string(),
            }),
        }

        project.updated_at = Utc::now();

        self.storage.save_project(&project).await?;

        Ok(true)
    }

    pub async fn get_sprint_report(&self, project_id: &str, sprint_id: &str) -> Result<SprintReport> {
        let project = self.storage.load_project(project_id).await?;
        let sprint = project.sprints
            .into_iter()
            .find(|s| s.id == sprint_id)
            .ok_or(ProjectManagementError::SprintNotFound {
                id: sprint_id.to_string(),
            })?;

        let all_tasks = self.storage.list_tasks(project_id).await?;
        let sprint_tasks: Vec<Task> = all_tasks
            .into_iter()
            .filter(|t| t.sprint_id.as_deref() == Some(sprint_id))
            .collect();

        let (tasks_completed, tasks_incomplete): (Vec<Task>, Vec<Task>) = sprint_tasks
            .into_iter()
            .partition(|t| t.status == "done");

        let total_story_points: u32 = tasks_completed.iter()
            .chain(tasks_incomplete.iter())
            .map(|t| t.estimate.unwrap_or(0))
            .sum();

        let completed_story_points: u32 = tasks_completed.iter()
            .map(|t| t.estimate.unwrap_or(0))
            .sum();

        let burndown_data = Vec::new(); // Simplified for now

        let sprint_duration = (sprint.end_date - sprint.start_date).num_days() as f64;
        let velocity = if sprint_duration > 0.0 {
            completed_story_points as f64 / sprint_duration
        } else {
            0.0
        };

        Ok(SprintReport {
            sprint,
            tasks_completed,
            tasks_incomplete,
            total_story_points,
            completed_story_points,
            burndown_data,
            velocity,
        })
    }
}