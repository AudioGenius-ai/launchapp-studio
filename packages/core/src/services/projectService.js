import { ProjectEvent } from '@code-pilot/types';
import { v4 as uuidv4 } from 'uuid';
export class ProjectService {
    repository;
    eventEmitter;
    constructor(repository, eventEmitter) {
        this.repository = repository;
        this.eventEmitter = eventEmitter;
    }
    async createProject(dto) {
        // Validate project data
        const validation = await this.validateProject(dto);
        if (!validation.isNameValid || !validation.isPathValid) {
            throw new Error(`Invalid project: ${validation.errors.join(', ')}`);
        }
        // Check if project already exists at this path
        const exists = await this.repository.exists(dto.path);
        if (exists) {
            throw new Error(`Project already exists at path: ${dto.path}`);
        }
        // Create default settings if not provided
        const defaultSettings = {
            gitEnabled: true,
            defaultBranch: 'main',
            extensions: [],
            ...dto.settings
        };
        // Create new project
        const project = {
            id: uuidv4(),
            name: dto.name,
            path: dto.path,
            description: dto.description,
            settings: defaultSettings,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const createdProject = await this.repository.create(project);
        // Emit event
        this.emitEvent(ProjectEvent.Created, createdProject);
        return createdProject;
    }
    async updateProject(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new Error(`Project not found: ${id}`);
        }
        const { settings, ...restDto } = dto;
        const updatedData = {
            ...restDto,
            updatedAt: new Date()
        };
        if (settings) {
            updatedData.settings = {
                ...existing.settings,
                ...settings
            };
        }
        const updatedProject = await this.repository.update(id, updatedData);
        if (!updatedProject) {
            throw new Error(`Failed to update project: ${id}`);
        }
        // Emit event
        this.emitEvent(ProjectEvent.Updated, updatedProject);
        return updatedProject;
    }
    async deleteProject(id) {
        const project = await this.repository.findById(id);
        if (!project) {
            throw new Error(`Project not found: ${id}`);
        }
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error(`Failed to delete project: ${id}`);
        }
        // Emit event
        this.emitEvent(ProjectEvent.Deleted, project);
    }
    async getProject(id) {
        const project = await this.repository.findById(id);
        if (!project) {
            throw new Error(`Project not found: ${id}`);
        }
        return project;
    }
    async listProjects(query = {}) {
        // Set defaults
        const finalQuery = {
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            limit: 20,
            offset: 0,
            ...query
        };
        return this.repository.findAll(finalQuery);
    }
    async openProject(id) {
        const project = await this.getProject(id);
        // Update last accessed time
        await this.repository.update(id, { updatedAt: new Date() });
        // Emit event
        this.emitEvent(ProjectEvent.Opened, project);
        return project;
    }
    async closeProject(id) {
        const project = await this.getProject(id);
        // Emit event
        this.emitEvent(ProjectEvent.Closed, project);
    }
    async validateProject(dto) {
        const errors = [];
        let isNameValid = true;
        let isPathValid = true;
        // Validate name
        if (!dto.name || dto.name.trim().length === 0) {
            errors.push('Project name is required');
            isNameValid = false;
        }
        else if (dto.name.length > 255) {
            errors.push('Project name must be less than 255 characters');
            isNameValid = false;
        }
        // Validate path
        if (!dto.path || dto.path.trim().length === 0) {
            errors.push('Project path is required');
            isPathValid = false;
        }
        else if (!this.isValidPath(dto.path)) {
            errors.push('Invalid project path');
            isPathValid = false;
        }
        return {
            isNameValid,
            isPathValid,
            errors
        };
    }
    isValidPath(path) {
        // Basic path validation - can be enhanced based on platform
        const invalidChars = ['<', '>', ':', '"', '|', '?', '*'];
        return !invalidChars.some(char => path.includes(char));
    }
    emitEvent(event, project) {
        if (this.eventEmitter) {
            const payload = {
                event,
                projectId: project.id,
                project,
                timestamp: new Date()
            };
            this.eventEmitter.emit(event, payload);
        }
    }
}
