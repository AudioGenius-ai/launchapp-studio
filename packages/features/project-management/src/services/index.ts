import { mcpProjectManagementService, MCPProjectManagementService } from './mcpService';
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
  private mcpService: MCPProjectManagementService;

  constructor(projectId?: string, workspacePath?: string) {
    this.mcpService = new MCPProjectManagementService(projectId, workspacePath);
  }

  setProjectContext(projectId: string, workspacePath: string) {
    this.mcpService.setProjectContext(projectId, workspacePath);
  }

  // Project operations
  async createProject(request: CreateProjectRequest): Promise<Project> {
    return this.mcpService.createProject(request);
  }

  async getProject(projectId: string): Promise<Project> {
    return this.mcpService.getProject(projectId);
  }

  async listProjects(): Promise<Project[]> {
    return this.mcpService.listProjects();
  }

  async deleteProject(projectId: string): Promise<boolean> {
    return this.mcpService.deleteProject(projectId);
  }

  async getProjectStatistics(projectId: string): Promise<ProjectStatistics> {
    return this.mcpService.getProjectStatistics(projectId);
  }

  // Task operations
  async createTask(projectId: string, request: CreateTaskRequest): Promise<Task> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.createTask(request);
  }

  async getTask(projectId: string, taskId: string): Promise<Task> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.getTask(taskId);
  }

  async listTasks(projectId: string, filter?: TaskFilter): Promise<Task[]> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.listTasks(filter);
  }

  async updateTask(projectId: string, taskId: string, request: Partial<CreateTaskRequest>): Promise<Task> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.updateTask(taskId, request);
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.deleteTask(taskId);
  }

  async searchTasks(projectId: string, query: string): Promise<Task[]> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.searchTasks(query);
  }

  async moveTaskToSprint(projectId: string, taskId: string, sprintId?: string): Promise<boolean> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.moveTaskToSprint(taskId, sprintId);
  }

  async addTaskComment(projectId: string, taskId: string, content: string, author: string): Promise<void> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.addTaskComment(taskId, content, author);
  }

  // Document operations
  async createDocument(projectId: string, request: CreateDocumentRequest): Promise<Document> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.createDocument(request);
  }

  async getDocument(projectId: string, documentId: string): Promise<Document> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.getDocument(documentId);
  }

  async listDocuments(projectId: string, filter?: DocumentFilter): Promise<Document[]> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.listDocuments(filter);
  }

  async updateDocument(projectId: string, documentId: string, request: Partial<CreateDocumentRequest>): Promise<Document> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.updateDocument(documentId, request);
  }

  async deleteDocument(projectId: string, documentId: string): Promise<boolean> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.deleteDocument(documentId);
  }

  async searchDocuments(projectId: string, query: string): Promise<Document[]> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.searchDocuments(query);
  }

  async renderDocument(projectId: string, documentId: string): Promise<string> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.renderDocument(documentId);
  }

  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return this.mcpService.getDocumentTemplates();
  }

  async createDocumentFromTemplate(projectId: string, template: DocumentTemplate, title: string): Promise<Document> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.createDocumentFromTemplate(template, title);
  }

  // Sprint operations
  async createSprint(projectId: string, request: CreateSprintRequest): Promise<Sprint> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.createSprint(request);
  }

  async getSprint(projectId: string, sprintId: string): Promise<Sprint> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.getSprint(sprintId);
  }

  async listSprints(projectId: string): Promise<Sprint[]> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.listSprints();
  }

  async startSprint(projectId: string, sprintId: string): Promise<boolean> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.startSprint(sprintId);
  }

  async completeSprint(projectId: string, sprintId: string): Promise<boolean> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.completeSprint(sprintId);
  }

  // Search operations
  async searchAll(projectId: string, query: string): Promise<{ tasks: Task[]; documents: Document[]; total_count: number }> {
    this.mcpService.setProjectContext(projectId, '.');
    return this.mcpService.searchAll(query);
  }
}

// Export singleton instance
export const projectManagementService = new ProjectManagementService();