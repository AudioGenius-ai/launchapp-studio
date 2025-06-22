use crate::error::Result;
use crate::models::*;
use crate::storage_manager::StorageManager;
use chrono::Utc;
use std::sync::Arc;
use tauri::AppHandle;

pub struct TaskService {
    storage: Arc<StorageManager>,
}

impl TaskService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            storage: Arc::new(StorageManager::new(app_handle)),
        }
    }

    pub async fn create_task(&self, project_id: &str, request: CreateTaskRequest) -> Result<Task> {
        let project = self.storage.load_project(project_id).await?;
        let task_number = self.storage.get_next_task_number(project_id).await?;

        let mut task = Task::new(
            project_id.to_string(),
            request.title,
            request.description,
            request.task_type,
            request.priority,
            project.owner,
            task_number,
        );

        task.assignee = request.assignee;
        task.labels = request.labels;
        task.due_date = request.due_date;
        task.estimate = request.estimate;
        task.parent_id = request.parent_id;
        task.custom_fields = request.custom_fields;

        self.storage.save_task(&task).await?;

        Ok(task)
    }

    pub async fn get_task(&self, project_id: &str, task_id: &str) -> Result<Task> {
        self.storage.load_task(project_id, task_id).await
    }

    pub async fn update_task(&self, project_id: &str, task_id: &str, request: UpdateTaskRequest) -> Result<Task> {
        let mut task = self.storage.load_task(project_id, task_id).await?;

        if let Some(title) = request.title {
            task.title = title;
        }
        if let Some(description) = request.description {
            task.description = description;
        }
        if let Some(status) = request.status {
            task.status = status;
        }
        if let Some(priority) = request.priority {
            task.priority = priority;
        }
        if let Some(assignee) = request.assignee {
            task.assignee = Some(assignee);
        }
        if let Some(labels) = request.labels {
            task.labels = labels;
        }
        if let Some(due_date) = request.due_date {
            task.due_date = Some(due_date);
        }
        if let Some(estimate) = request.estimate {
            task.estimate = Some(estimate);
        }
        if let Some(time_spent) = request.time_spent {
            task.time_spent = Some(time_spent);
        }
        if let Some(custom_fields) = request.custom_fields {
            task.custom_fields = custom_fields;
        }

        task.updated_at = Utc::now();

        self.storage.save_task(&task).await?;

        Ok(task)
    }

    pub async fn delete_task(&self, project_id: &str, task_id: &str) -> Result<bool> {
        self.storage.delete_task(project_id, task_id).await?;
        Ok(true)
    }

    pub async fn list_tasks(&self, project_id: &str, filter: Option<TaskFilter>) -> Result<Vec<Task>> {
        let mut tasks = self.storage.list_tasks(project_id).await?;

        if let Some(filter) = filter {
            tasks = self.apply_task_filters(tasks, filter);
        }

        Ok(tasks)
    }

    pub async fn search_tasks(&self, project_id: &str, query: &str) -> Result<Vec<Task>> {
        self.storage.search_tasks(project_id, query).await
    }

    pub async fn move_task_to_sprint(&self, project_id: &str, task_id: &str, sprint_id: Option<String>) -> Result<bool> {
        let mut task = self.storage.load_task(project_id, task_id).await?;
        task.sprint_id = sprint_id;
        task.updated_at = Utc::now();
        self.storage.save_task(&task).await?;
        Ok(true)
    }

    pub async fn add_task_comment(&self, project_id: &str, task_id: &str, content: String, author: String) -> Result<TaskComment> {
        let mut task = self.storage.load_task(project_id, task_id).await?;
        
        let comment = TaskComment {
            id: uuid::Uuid::new_v4().to_string(),
            author,
            content,
            created_at: Utc::now(),
            updated_at: None,
        };

        task.comments.push(comment.clone());
        task.updated_at = Utc::now();
        
        self.storage.save_task(&task).await?;
        Ok(comment)
    }

    pub async fn remove_task_comment(&self, project_id: &str, task_id: &str, comment_id: &str) -> Result<bool> {
        let mut task = self.storage.load_task(project_id, task_id).await?;
        let initial_len = task.comments.len();
        task.comments.retain(|c| c.id != comment_id);
        
        if task.comments.len() < initial_len {
            task.updated_at = Utc::now();
            self.storage.save_task(&task).await?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn apply_task_filters(&self, mut tasks: Vec<Task>, filter: TaskFilter) -> Vec<Task> {
        if let Some(status_filter) = filter.status {
            tasks.retain(|t| status_filter.contains(&t.status));
        }
        if let Some(priority_filter) = filter.priority {
            tasks.retain(|t| priority_filter.contains(&t.priority));
        }
        if let Some(type_filter) = filter.task_type {
            tasks.retain(|t| type_filter.contains(&t.task_type));
        }
        if let Some(assignee_filter) = filter.assignee {
            tasks.retain(|t| t.assignee.as_ref().map_or(false, |a| assignee_filter.contains(a)));
        }
        if let Some(sprint_id) = filter.sprint_id {
            tasks.retain(|t| t.sprint_id.as_ref() == Some(&sprint_id));
        }
        tasks
    }
}