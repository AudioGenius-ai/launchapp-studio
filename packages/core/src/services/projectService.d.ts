import { Project, CreateProjectDto, UpdateProjectDto, ProjectQuery, ProjectListResponse } from '@code-pilot/types';
export interface IProjectRepository {
    findById(id: string): Promise<Project | null>;
    findAll(query: ProjectQuery): Promise<ProjectListResponse>;
    create(project: Project): Promise<Project>;
    update(id: string, project: Partial<Project>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
    exists(path: string): Promise<boolean>;
}
export interface IEventEmitter {
    emit(event: string, payload: any): void;
}
export declare class ProjectService {
    private repository;
    private eventEmitter?;
    constructor(repository: IProjectRepository, eventEmitter?: IEventEmitter | undefined);
    createProject(dto: CreateProjectDto): Promise<Project>;
    updateProject(id: string, dto: UpdateProjectDto): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    getProject(id: string): Promise<Project>;
    listProjects(query?: ProjectQuery): Promise<ProjectListResponse>;
    openProject(id: string): Promise<Project>;
    closeProject(id: string): Promise<void>;
    private validateProject;
    private isValidPath;
    private emitEvent;
}
//# sourceMappingURL=projectService.d.ts.map