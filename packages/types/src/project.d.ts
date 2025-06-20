import { Project, ProjectSettings } from './index';
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
export interface ProjectQuery {
    searchTerm?: string;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface ProjectListResponse {
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
}
export interface ProjectValidation {
    isNameValid: boolean;
    isPathValid: boolean;
    errors: string[];
}
export declare enum ProjectEvent {
    Created = "project:created",
    Updated = "project:updated",
    Deleted = "project:deleted",
    Opened = "project:opened",
    Closed = "project:closed"
}
export interface ProjectEventPayload {
    event: ProjectEvent;
    projectId: string;
    project?: Project;
    timestamp: Date;
}
export { Project, ProjectSettings } from './index';
//# sourceMappingURL=project.d.ts.map