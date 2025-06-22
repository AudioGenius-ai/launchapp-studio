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

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface MCPRequest {
  name: string;
  arguments: Record<string, any>;
}

export class MCPProjectManagementService {
  private currentProjectId: string = 'default';
  private workspacePath: string = '.';

  constructor(projectId?: string, workspacePath?: string) {
    if (projectId) this.currentProjectId = projectId;
    if (workspacePath) this.workspacePath = workspacePath;
  }

  setProjectContext(projectId: string, workspacePath: string) {
    this.currentProjectId = projectId;
    this.workspacePath = workspacePath;
  }

  private async callMCPTool(toolName: string, arguments_: Record<string, any> = {}): Promise<MCPResponse> {
    try {
      // Get MCP server instances
      const instances = await invoke('plugin:mcp-webserver|list_instances') as any[];
      
      if (instances.length === 0) {
        throw new Error('No MCP server instances available');
      }

      // Use the first available instance
      const instance = instances[0];

      // Call the tool with project context headers
      const response = await invoke('plugin:mcp-webserver|call_tool', {
        instanceId: instance.id,
        request: {
          name: toolName,
          arguments: arguments_,
        },
        headers: {
          'x-project-id': this.currentProjectId,
          'x-workspace-path': this.workspacePath,
        }
      }) as MCPResponse;

      return response;
    } catch (error) {
      console.error(`MCP tool call failed for ${toolName}:`, error);
      throw error;
    }
  }

  // Project operations
  async createProject(request: CreateProjectRequest): Promise<Project> {
    const response = await this.callMCPTool('pm_create_project', request);
    // For now, return a mock project since the MCP server returns text
    // In a real implementation, this would parse the actual response
    return {
      id: 'new-project-id',
      name: request.name,
      key: request.key,
      description: request.description,
      owner: request.owner,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        task_prefix: request.key,
        default_assignee: null,
        custom_fields: {},
        workflow_states: ['todo', 'in_progress', 'done'],
        issue_types: ['story', 'task', 'bug'],
        priorities: ['low', 'medium', 'high', 'urgent'],
      },
      members: [],
      sprints: [],
    };
  }

  async getProject(projectId?: string): Promise<Project> {
    const response = await this.callMCPTool('pm_get_project', {
      project_id: projectId || this.currentProjectId
    });
    // Mock response for now
    return {
      id: projectId || this.currentProjectId,
      name: 'Sample Project',
      key: 'SAMPLE',
      description: 'A sample project',
      owner: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        task_prefix: 'SAMPLE',
        default_assignee: null,
        custom_fields: {},
        workflow_states: ['todo', 'in_progress', 'done'],
        issue_types: ['story', 'task', 'bug'],
        priorities: ['low', 'medium', 'high', 'urgent'],
      },
      members: [],
      sprints: [],
    };
  }

  async listProjects(): Promise<Project[]> {
    const response = await this.callMCPTool('pm_list_projects');
    // Mock response for now
    return [];
  }

  async deleteProject(projectId?: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_delete_project', {
      project_id: projectId || this.currentProjectId
    });
    return true;
  }

  async getProjectStatistics(projectId?: string): Promise<ProjectStatistics> {
    const response = await this.callMCPTool('pm_get_project_statistics', {
      project_id: projectId || this.currentProjectId
    });
    // Mock response for now
    return {
      total_tasks: 0,
      completed_tasks: 0,
      in_progress_tasks: 0,
      blocked_tasks: 0,
      total_documents: 0,
      active_sprints: 0,
      completion_rate: 0,
    };
  }

  // Task operations
  async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await this.callMCPTool('pm_create_task', request);
    // Mock response for now
    return {
      id: 'new-task-id',
      project_id: this.currentProjectId,
      key: `${this.currentProjectId}-1`,
      title: request.title,
      description: request.description,
      status: 'todo',
      priority: request.priority,
      task_type: request.task_type,
      assignee: request.assignee || null,
      reporter: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: request.due_date || null,
      estimate: request.estimate || null,
      time_spent: null,
      sprint_id: null,
      parent_id: request.parent_id || null,
      labels: request.labels || [],
      comments: [],
      attachments: [],
      custom_fields: request.custom_fields || {},
      task_number: 1,
    };
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.callMCPTool('pm_get_task', { task_id: taskId });
    // Mock response for now
    return {
      id: taskId,
      project_id: this.currentProjectId,
      key: `${this.currentProjectId}-1`,
      title: 'Sample Task',
      description: 'A sample task',
      status: 'todo',
      priority: 'medium',
      task_type: 'story',
      assignee: null,
      reporter: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: null,
      estimate: null,
      time_spent: null,
      sprint_id: null,
      parent_id: null,
      labels: [],
      comments: [],
      attachments: [],
      custom_fields: {},
      task_number: 1,
    };
  }

  async listTasks(filter?: TaskFilter): Promise<Task[]> {
    const response = await this.callMCPTool('pm_list_tasks', filter || {});
    // Mock response for now
    return [];
  }

  async updateTask(taskId: string, request: Partial<CreateTaskRequest>): Promise<Task> {
    const response = await this.callMCPTool('pm_update_task', {
      task_id: taskId,
      ...request
    });
    // Return updated task (mock for now)
    const existingTask = await this.getTask(taskId);
    return {
      ...existingTask,
      ...request,
      updated_at: new Date().toISOString(),
    };
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_delete_task', { task_id: taskId });
    return true;
  }

  async searchTasks(query: string): Promise<Task[]> {
    const response = await this.callMCPTool('pm_search_tasks', { query });
    return [];
  }

  async moveTaskToSprint(taskId: string, sprintId?: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_move_task_to_sprint', {
      task_id: taskId,
      sprint_id: sprintId || null
    });
    return true;
  }

  async addTaskComment(taskId: string, content: string, author: string): Promise<void> {
    const response = await this.callMCPTool('pm_add_task_comment', {
      task_id: taskId,
      content,
      author
    });
  }

  // Document operations
  async createDocument(request: CreateDocumentRequest): Promise<Document> {
    const response = await this.callMCPTool('pm_create_document', request);
    // Mock response for now
    return {
      id: 'new-document-id',
      project_id: this.currentProjectId,
      title: request.title,
      content: request.content || '',
      status: 'draft',
      template: request.template,
      author: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: request.tags || [],
      parent_id: request.parent_id || null,
      permissions: request.permissions,
    };
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await this.callMCPTool('pm_get_document', { document_id: documentId });
    // Mock response for now
    return {
      id: documentId,
      project_id: this.currentProjectId,
      title: 'Sample Document',
      content: '# Sample Document\n\nThis is a sample document.',
      status: 'draft',
      template: 'page',
      author: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      parent_id: null,
      permissions: {
        read: [],
        write: [],
        admin: [],
      },
    };
  }

  async listDocuments(filter?: DocumentFilter): Promise<Document[]> {
    const response = await this.callMCPTool('pm_list_documents', filter || {});
    return [];
  }

  async updateDocument(documentId: string, request: Partial<CreateDocumentRequest>): Promise<Document> {
    const response = await this.callMCPTool('pm_update_document', {
      document_id: documentId,
      ...request
    });
    // Return updated document (mock for now)
    const existingDocument = await this.getDocument(documentId);
    return {
      ...existingDocument,
      ...request,
      updated_at: new Date().toISOString(),
    };
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_delete_document', { document_id: documentId });
    return true;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const response = await this.callMCPTool('pm_search_documents', { query });
    return [];
  }

  async renderDocument(documentId: string): Promise<string> {
    const response = await this.callMCPTool('pm_render_document', { document_id: documentId });
    return '<p>Rendered document content</p>';
  }

  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    // This doesn't need MCP call as it's static data
    return ['page', 'blog', 'requirements', 'api_doc', 'meeting', 'troubleshooting', 'user_guide', 'technical_spec'];
  }

  async createDocumentFromTemplate(template: DocumentTemplate, title: string): Promise<Document> {
    const request = {
      title,
      template,
      content: '', // Will be filled by template
      tags: [],
      permissions: {
        read: [],
        write: [],
        admin: [],
      },
    };
    return this.createDocument(request);
  }

  // Sprint operations
  async createSprint(request: CreateSprintRequest): Promise<Sprint> {
    const response = await this.callMCPTool('pm_create_sprint', request);
    // Mock response for now
    return {
      id: 'new-sprint-id',
      project_id: this.currentProjectId,
      name: request.name,
      start_date: request.start_date,
      end_date: request.end_date,
      status: 'planned',
      goal: request.goal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getSprint(sprintId: string): Promise<Sprint> {
    const response = await this.callMCPTool('pm_get_sprint', { sprint_id: sprintId });
    // Mock response for now
    return {
      id: sprintId,
      project_id: this.currentProjectId,
      name: 'Sample Sprint',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planned',
      goal: 'Complete sample tasks',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async listSprints(): Promise<Sprint[]> {
    const response = await this.callMCPTool('pm_list_sprints');
    return [];
  }

  async startSprint(sprintId: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_start_sprint', { sprint_id: sprintId });
    return true;
  }

  async completeSprint(sprintId: string): Promise<boolean> {
    const response = await this.callMCPTool('pm_complete_sprint', { sprint_id: sprintId });
    return true;
  }

  // Search operations
  async searchAll(query: string): Promise<{ tasks: Task[]; documents: Document[]; total_count: number }> {
    const response = await this.callMCPTool('pm_search_all', { query });
    return {
      tasks: [],
      documents: [],
      total_count: 0,
    };
  }
}

// Export singleton instance that can be updated with project context
export const mcpProjectManagementService = new MCPProjectManagementService();