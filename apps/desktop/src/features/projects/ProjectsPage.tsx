import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-opener';
import { ProjectList, CreateProjectDialog } from '@code-pilot/ui';
import { Project, CreateProjectDto, ProjectListResponse } from '@code-pilot/types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoke<ProjectListResponse>('list_projects');
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (dto: CreateProjectDto) => {
    try {
      const project = await invoke<Project>('create_project', { dto });
      setProjects(prev => [project, ...prev]);
      setCreateDialogOpen(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleOpenProject = async (project: Project) => {
    try {
      await invoke<Project>('open_project', { id: project.id });
      // Here you would typically navigate to the project workspace
      console.log('Opening project:', project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open project');
    }
  };

  const handleEditProject = async (project: Project) => {
    // TODO: Implement edit functionality
    console.log('Edit project:', project);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await invoke('delete_project', { id: project.id });
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleSelectDirectory = async (): Promise<string | null> => {
    try {
      // Use Tauri's dialog API to select a directory
      const selected = await open({
        multiple: false,
        directory: true,
      });
      return selected as string | null;
    } catch (err) {
      console.error('Error selecting directory:', err);
      return null;
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <ProjectList
          projects={projects}
          loading={loading}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onProjectOpen={handleOpenProject}
          onProjectEdit={handleEditProject}
          onProjectDelete={handleDeleteProject}
          onCreateProject={() => setCreateDialogOpen(true)}
        />

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreateProject={handleCreateProject}
          onSelectDirectory={handleSelectDirectory}
        />
      </div>
    </div>
  );
};