import { useState, useCallback } from 'react';
import { useTemplatesStore } from '../stores/templatesStore';
import { CreateProjectOptions } from '../types';
import { invoke } from '@tauri-apps/api/core';

export const useTemplateCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const createProject = useTemplatesStore(state => state.createProject);

  const create = useCallback(async (options: CreateProjectOptions) => {
    setIsCreating(true);
    setProgress(0);
    setCurrentStep('Initializing project...');

    try {
      // Validate project path
      setProgress(10);
      setCurrentStep('Validating project location...');
      
      const exists = await invoke<boolean>('path_exists', { 
        path: options.projectPath 
      });
      
      if (exists) {
        const isEmpty = await invoke<boolean>('is_directory_empty', { 
          path: options.projectPath 
        });
        
        if (!isEmpty) {
          throw new Error('Project directory is not empty');
        }
      }

      // Create project from template
      setProgress(30);
      setCurrentStep('Creating project structure...');
      await createProject(options);

      // Initialize git repository if requested
      setProgress(60);
      setCurrentStep('Initializing git repository...');
      await invoke('plugin:git|init', { 
        path: options.projectPath 
      });

      // Install dependencies
      setProgress(80);
      setCurrentStep('Installing dependencies...');
      const packageManager = options.overrides?.packageManager || 'pnpm';
      await invoke('plugin:terminal|run_command', {
        command: `${packageManager} install`,
        cwd: options.projectPath
      });

      setProgress(100);
      setCurrentStep('Project created successfully!');
      
      return options.projectPath;
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [createProject]);

  const validateProjectName = useCallback((name: string): string | null => {
    if (!name) {
      return 'Project name is required';
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return 'Project name can only contain letters, numbers, hyphens, and underscores';
    }

    if (name.length > 214) {
      return 'Project name is too long';
    }

    return null;
  }, []);

  const suggestProjectPath = useCallback(async (projectName: string): Promise<string> => {
    try {
      const homePath = await invoke<string>('get_home_dir');
      return `${homePath}/Projects/${projectName}`;
    } catch {
      return `/Users/Projects/${projectName}`;
    }
  }, []);

  return {
    create,
    isCreating,
    progress,
    currentStep,
    validateProjectName,
    suggestProjectPath
  };
};