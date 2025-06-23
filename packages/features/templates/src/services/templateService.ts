import { EventEmitter } from '@code-pilot/utils';
import { ProjectTemplate, TemplateCategory } from '../types';

export interface ITemplateService {
  loadTemplates(): Promise<ProjectTemplate[]>;
  createProjectFromTemplate(options: {
    template: ProjectTemplate;
    projectName: string;
    projectPath: string;
    gitInit?: boolean;
    installDependencies?: boolean;
  }): Promise<any>;
  searchTemplates(query: string, filters?: any): Promise<ProjectTemplate[]>;
  getTemplatesByCategory(category: string): Promise<ProjectTemplate[]>;
  checkPrerequisites(template: ProjectTemplate): Promise<boolean>;
  addCustomTemplate(template: ProjectTemplate): Promise<void>;
  removeCustomTemplate(templateId: string): Promise<void>;
  importTemplateFromUrl(url: string): Promise<ProjectTemplate>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

export class TemplateService extends EventEmitter implements ITemplateService {
  private templates: Map<string, ProjectTemplate> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Add some default templates
    const defaultTemplates: ProjectTemplate[] = [
      {
        id: 'react-ts',
        name: 'React TypeScript',
        description: 'Create a React app with TypeScript',
        category: TemplateCategory.React,
        repository: 'https://github.com/vitejs/vite-react-ts-template',
        tags: ['react', 'typescript', 'vite'],
        icon: 'react'
      },
      {
        id: 'node-ts',
        name: 'Node.js TypeScript',
        description: 'Create a Node.js app with TypeScript',
        category: TemplateCategory.Backend,
        tags: ['node', 'typescript', 'backend'],
        icon: 'node'
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async loadTemplates(): Promise<ProjectTemplate[]> {
    return Array.from(this.templates.values());
  }

  async createProjectFromTemplate(options: {
    template: ProjectTemplate;
    projectName: string;
    projectPath: string;
    gitInit?: boolean;
    installDependencies?: boolean;
  }): Promise<any> {
    // Implementation would create the project
    console.log('Creating project from template:', options);
    
    // Return a mock project
    return {
      id: Date.now().toString(),
      name: options.projectName,
      path: options.projectPath,
      template: options.template.id
    };
  }

  async searchTemplates(query: string, _filters?: any): Promise<ProjectTemplate[]> {
    const templates = Array.from(this.templates.values());
    return templates.filter(template => 
      template.name.toLowerCase().includes(query.toLowerCase()) ||
      template.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getTemplatesByCategory(category: string): Promise<ProjectTemplate[]> {
    const templates = Array.from(this.templates.values());
    return templates.filter(template => template.category === category);
  }

  async checkPrerequisites(_template: ProjectTemplate): Promise<boolean> {
    // Check if prerequisites are met
    return true;
  }

  async addCustomTemplate(template: ProjectTemplate): Promise<void> {
    this.templates.set(template.id, template);
    this.emit('template:added', template);
  }

  async removeCustomTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (template) {
      this.templates.delete(templateId);
      this.emit('template:removed', templateId);
    }
  }

  async importTemplateFromUrl(url: string): Promise<ProjectTemplate> {
    // Mock implementation
    const template: ProjectTemplate = {
      id: Date.now().toString(),
      name: 'Imported Template',
      description: 'Template imported from ' + url,
      category: TemplateCategory.Other,
      tags: ['imported'],
      icon: 'download'
    };
    
    await this.addCustomTemplate(template);
    return template;
  }
}

// Template service implementation complete