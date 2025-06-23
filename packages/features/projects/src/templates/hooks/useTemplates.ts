import { useState, useEffect } from 'react';
import { ProjectTemplate } from '@code-pilot/feature-templates';
import { TemplateService, ITemplateService } from '@code-pilot/feature-templates';
import { useProjectService } from '@code-pilot/hooks';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { homeDir } from '@tauri-apps/api/path';

export function useTemplates() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateService] = useState<ITemplateService>(() => new TemplateService());
  const { createProject } = useProjectService();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();

    // Listen for template events
    const handleTemplateAdded = (template: ProjectTemplate) => {
      setTemplates(prev => [...prev, template]);
    };

    const handleTemplateRemoved = (templateId: string) => {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    templateService.on('template:added', handleTemplateAdded);
    templateService.on('template:removed', handleTemplateRemoved);

    return () => {
      templateService.off('template:added', handleTemplateAdded);
      templateService.off('template:removed', handleTemplateRemoved);
    };
  }, [templateService]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTemplates = await templateService.loadTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProjectFromTemplate = async (
    template: ProjectTemplate,
    options: {
      projectName: string;
      projectPath: string;
      gitInit?: boolean;
      installDependencies?: boolean;
      openInEditor?: boolean;
    }
  ) => {
    try {
      // Create project using template service
      const project = await templateService.createProjectFromTemplate({
        template,
        ...options,
      });

      // If openInEditor is true, emit event to open the project
      if (options.openInEditor) {
        // This would typically emit an event to open the project in the editor
        console.log('Opening project in editor:', project);
      }

      return project;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const openFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
        defaultPath: await homeDir(),
      });

      if (selected) {
        // Create project from existing folder
        const projectName = selected.split('/').pop() || 'Untitled';
        const project = await createProject({
          name: projectName,
          path: selected,
          description: 'Imported from existing folder',
        });
        return project;
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
      throw err;
    }
  };

  const cloneRepository = async () => {
    // This would open a dialog to clone a Git repository
    // For now, just log
    console.log('Clone repository feature not yet implemented');
  };

  const searchTemplates = async (query: string, filters?: any) => {
    return templateService.searchTemplates(query, filters);
  };

  const getTemplatesByCategory = async (category: any) => {
    return templateService.getTemplatesByCategory(category);
  };

  const checkPrerequisites = async (template: ProjectTemplate) => {
    return templateService.checkPrerequisites(template);
  };

  const addCustomTemplate = async (template: ProjectTemplate) => {
    return templateService.addCustomTemplate(template);
  };

  const removeCustomTemplate = async (templateId: string) => {
    return templateService.removeCustomTemplate(templateId);
  };

  const importTemplateFromUrl = async (url: string) => {
    return templateService.importTemplateFromUrl(url);
  };

  return {
    templates,
    loading,
    error,
    loadTemplates,
    createProjectFromTemplate,
    openFolder,
    cloneRepository,
    searchTemplates,
    getTemplatesByCategory,
    checkPrerequisites,
    addCustomTemplate,
    removeCustomTemplate,
    importTemplateFromUrl,
  };
}