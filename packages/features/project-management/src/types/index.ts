// Re-export types from the Tauri plugin
export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  owner: string;
  created_at: string;
  updated_at: string;
  settings: ProjectSettings;
  members: ProjectMember[];
  sprints: Sprint[];
}

export interface ProjectSettings {
  task_prefix: string;
  default_assignee: string | null;
  custom_fields: Record<string, CustomField>;
  workflow_states: string[];
  issue_types: string[];
  priorities: string[];
}

export interface ProjectMember {
  user_id: string;
  role: ProjectRole;
  joined_at: string;
}

export enum ProjectRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
  Viewer = "viewer",
}

export interface Task {
  id: string;
  project_id: string;
  key: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  task_type: string;
  assignee: string | null;
  reporter: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  estimate: number | null;
  time_spent: number | null;
  sprint_id: string | null;
  parent_id: string | null;
  labels: string[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  custom_fields: Record<string, any>;
  task_number: number;
}

export interface TaskComment {
  id: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  goal: string;
  created_at: string;
  updated_at: string;
}

export enum SprintStatus {
  Planned = "planned",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled",
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  template: DocumentTemplate;
  author: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  parent_id: string | null;
  permissions: DocumentPermissions;
}

export enum DocumentStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export enum DocumentTemplate {
  Page = "page",
  Blog = "blog",
  Requirements = "requirements",
  ApiDoc = "api_doc",
  Meeting = "meeting",
  Troubleshooting = "troubleshooting",
  UserGuide = "user_guide",
  TechnicalSpec = "technical_spec",
}

export interface DocumentPermissions {
  read: string[];
  write: string[];
  admin: string[];
}

export interface CustomField {
  field_type: string;
  required: boolean;
  options: string[] | null;
  default_value: any;
}

// UI-specific types
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  task_type?: string[];
  assignee?: string[];
  sprint_id?: string;
}

export interface DocumentFilter {
  status?: DocumentStatus[];
  template?: DocumentTemplate[];
  author?: string[];
  tags?: string[];
  parent_id?: string;
}

export interface ViewMode {
  type: 'kanban' | 'list' | 'calendar';
  groupBy?: 'status' | 'assignee' | 'priority' | 'sprint';
}

export interface ProjectStatistics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  total_documents: number;
  active_sprints: number;
  completion_rate: number;
}

// Request types
export interface CreateProjectRequest {
  name: string;
  key: string;
  description: string;
  owner: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  task_type: string;
  priority: string;
  assignee?: string;
  labels: string[];
  due_date?: string;
  estimate?: number;
  parent_id?: string;
  custom_fields: Record<string, any>;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  template: DocumentTemplate;
  tags: string[];
  parent_id?: string;
  permissions: DocumentPermissions;
}

export interface CreateSprintRequest {
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
}