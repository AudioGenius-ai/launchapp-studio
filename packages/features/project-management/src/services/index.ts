import { invoke } from '@tauri-apps/api/core';
import type {
  Project,
  Task,
  Document,
  Sprint,
  CreateProjectRequest,
  CreateTaskRequest,
  CreateDocumentRequest,
  CreateSprintRequest,
  TaskFilter,
  DocumentFilter,
  ProjectStatistics,
  DocumentTemplate,
} from '../types';

export class ProjectManagementService {
  // Project operations
  async createProject(request: CreateProjectRequest): Promise<Project> {
    return invoke('plugin:project-management|create_project', { request });
  }

  async getProject(projectId: string): Promise<Project> {
    return invoke('plugin:project-management|get_project', { projectId });
  }

  async listProjects(): Promise<Project[]> {
    return invoke('plugin:project-management|list_projects');
  }

  async deleteProject(projectId: string): Promise<boolean> {
    return invoke('plugin:project-management|delete_project', { projectId });
  }

  async getProjectStatistics(projectId: string): Promise<ProjectStatistics> {
    return invoke('plugin:project-management|get_project_statistics', { projectId });
  }

  // Task operations
  async createTask(projectId: string, request: CreateTaskRequest): Promise<Task> {
    return invoke('plugin:project-management|create_task', { projectId, request });
  }

  async getTask(projectId: string, taskId: string): Promise<Task> {
    return invoke('plugin:project-management|get_task', { projectId, taskId });
  }

  async listTasks(projectId: string, filter?: TaskFilter): Promise<Task[]> {
    return invoke('plugin:project-management|list_tasks', { projectId, filter });
  }

  async updateTask(projectId: string, taskId: string, request: Partial<CreateTaskRequest>): Promise<Task> {
    return invoke('plugin:project-management|update_task', { projectId, taskId, request });
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    return invoke('plugin:project-management|delete_task', { projectId, taskId });
  }

  async searchTasks(projectId: string, query: string): Promise<Task[]> {
    return invoke('plugin:project-management|search_tasks', { projectId, query });
  }

  async moveTaskToSprint(projectId: string, taskId: string, sprintId?: string): Promise<boolean> {
    return invoke('plugin:project-management|move_task_to_sprint', { projectId, taskId, sprintId });
  }

  async addTaskComment(projectId: string, taskId: string, content: string, author: string): Promise<void> {
    return invoke('plugin:project-management|add_task_comment', { projectId, taskId, content, author });
  }

  // Document operations
  async createDocument(projectId: string, request: CreateDocumentRequest): Promise<Document> {
    return invoke('plugin:project-management|create_document', { projectId, request });
  }

  async getDocument(projectId: string, documentId: string): Promise<Document> {
    return invoke('plugin:project-management|get_document', { projectId, documentId });
  }

  async listDocuments(projectId: string, filter?: DocumentFilter): Promise<Document[]> {
    return invoke('plugin:project-management|list_documents', { projectId, filter });
  }

  async updateDocument(projectId: string, documentId: string, request: Partial<CreateDocumentRequest>): Promise<Document> {
    return invoke('plugin:project-management|update_document', { projectId, documentId, request });
  }

  async deleteDocument(projectId: string, documentId: string): Promise<boolean> {
    return invoke('plugin:project-management|delete_document', { projectId, documentId });
  }

  async searchDocuments(projectId: string, query: string): Promise<Document[]> {
    return invoke('plugin:project-management|search_documents', { projectId, query });
  }

  async renderDocument(projectId: string, documentId: string): Promise<string> {
    return invoke('plugin:project-management|render_document', { projectId, documentId });
  }

  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return invoke('plugin:project-management|get_document_templates');
  }

  async createDocumentFromTemplate(projectId: string, template: DocumentTemplate, title: string): Promise<Document> {
    return invoke('plugin:project-management|create_document_from_template', { projectId, template, title });
  }

  // Sprint operations
  async createSprint(projectId: string, request: CreateSprintRequest): Promise<Sprint> {
    return invoke('plugin:project-management|create_sprint', { projectId, request });
  }

  async getSprint(projectId: string, sprintId: string): Promise<Sprint> {
    return invoke('plugin:project-management|get_sprint', { projectId, sprintId });
  }

  async listSprints(projectId: string): Promise<Sprint[]> {
    return invoke('plugin:project-management|list_sprints', { projectId });
  }

  async startSprint(projectId: string, sprintId: string): Promise<boolean> {
    return invoke('plugin:project-management|start_sprint', { projectId, sprintId });
  }

  async completeSprint(projectId: string, sprintId: string): Promise<boolean> {
    return invoke('plugin:project-management|complete_sprint', { projectId, sprintId });
  }

  // Search operations
  async searchAll(projectId: string, query: string): Promise<{ tasks: Task[]; documents: Document[]; total_count: number }> {
    return invoke('plugin:project-management|search_all', { projectId, query });
  }
}

// Export singleton instance
export const projectManagementService = new ProjectManagementService();