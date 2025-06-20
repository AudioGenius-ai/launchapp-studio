// Project-related type definitions

import { Project, ProjectSettings } from './index';

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
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Project response types
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
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

// Re-export from index for convenience
export { Project, ProjectSettings } from './index';