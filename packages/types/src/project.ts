// Project-related type definitions

// Define Project types here to avoid circular dependency
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  tags?: string[];
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  gitEnabled: boolean;
  defaultBranch: string;
  aiProvider?: string;
  extensions: string[];
}

// Project creation and update DTOs
export interface CreateProjectDto {
  name: string;
  path: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

// Project query types
export interface ProjectQuery {
  search?: string;
  searchTerm?: string;
  tags?: string[];
  status?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  page?: number;
}

// Project response types
export interface ProjectListResponse {
  projects?: Project[];
  items?: Project[];
  total: number;
  limit: number;
  offset?: number;
  page?: number;
  hasMore?: boolean;
}

// Project validation types
export interface ProjectValidation {
  isNameValid: boolean;
  isPathValid: boolean;
  errors: string[];
}

// Project events
export enum ProjectEvent {
  Created = 'project:created',
  Updated = 'project:updated',
  Deleted = 'project:deleted',
  Opened = 'project:opened',
  Closed = 'project:closed'
}

export interface ProjectEventPayload {
  event: ProjectEvent;
  projectId: string;
  project?: Project;
  timestamp: Date;
}

