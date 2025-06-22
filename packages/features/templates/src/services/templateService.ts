import { invoke } from '@tauri-apps/api/core';
import { Template, TemplateFile, CreateProjectOptions } from '../types';

export class TemplateService {
  /**
   * Clone a git repository as a template
   */
  static async cloneTemplate(
    repository: string,
    destination: string,
    branch?: string
  ): Promise<void> {
    await invoke('plugin:git|clone', {
      url: repository,
      path: destination,
      branch
    });
  }

  /**
   * Download a template from a URL
   */
  static async downloadTemplate(url: string): Promise<Template> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as Template;
  }

  /**
   * Create project files from template
   */
  static async createProjectFiles(
    projectPath: string,
    files: TemplateFile[]
  ): Promise<void> {
    for (const file of files) {
      const filePath = `${projectPath}/${file.path}`;
      
      // Create directory if needed
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      await invoke('create_directory', { path: dir });
      
      // Write file
      const content = file.encoding === 'base64' 
        ? atob(file.content) 
        : file.content;
        
      await invoke('write_file', {
        path: filePath,
        content
      });
    }
  }

  /**
   * Replace template variables in content
   */
  static replaceTemplateVars(
    content: string,
    variables: Record<string, string>
  ): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Validate template structure
   */
  static validateTemplate(template: Template): string[] {
    const errors: string[] = [];
    
    if (!template.id) {
      errors.push('Template must have an ID');
    }
    
    if (!template.name) {
      errors.push('Template must have a name');
    }
    
    if (!template.category) {
      errors.push('Template must have a category');
    }
    
    if (!template.description) {
      errors.push('Template must have a description');
    }
    
    if (!Array.isArray(template.tags)) {
      errors.push('Template tags must be an array');
    }
    
    return errors;
  }

  /**
   * Get template from local storage
   */
  static async getLocalTemplates(): Promise<Template[]> {
    try {
      const templatesJson = await invoke<string>('read_file', {
        path: 'templates.json'
      });
      
      return JSON.parse(templatesJson) as Template[];
    } catch {
      return [];
    }
  }

  /**
   * Save template to local storage
   */
  static async saveLocalTemplate(template: Template): Promise<void> {
    const templates = await this.getLocalTemplates();
    
    // Replace existing or add new
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    
    await invoke('write_file', {
      path: 'templates.json',
      content: JSON.stringify(templates, null, 2)
    });
  }

  /**
   * Delete template from local storage
   */
  static async deleteLocalTemplate(templateId: string): Promise<void> {
    const templates = await this.getLocalTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    
    await invoke('write_file', {
      path: 'templates.json',
      content: JSON.stringify(filtered, null, 2)
    });
  }

  /**
   * Export template as JSON
   */
  static exportTemplate(template: Template): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  static importTemplate(json: string): Template {
    const template = JSON.parse(json) as Template;
    const errors = this.validateTemplate(template);
    
    if (errors.length > 0) {
      throw new Error(`Invalid template: ${errors.join(', ')}`);
    }
    
    return template;
  }
}