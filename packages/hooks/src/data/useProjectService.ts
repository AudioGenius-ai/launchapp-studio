import { useState, useCallback } from 'react';
import { projectService } from '@code-pilot/core';
import type { CreateProjectDto, UpdateProjectDto } from '@code-pilot/types';

export function useProjectService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = useCallback(async (data: CreateProjectDto) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.createProject(data);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, data: UpdateProjectDto) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.updateProject(id, data);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectService.deleteProject(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectService.listProjects();
      return response.items;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get projects'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.getProject(id);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const openProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.openProject(id);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to open project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    updateProject,
    deleteProject,
    getProjects,
    getProject,
    openProject,
    loading,
    error,
  };
}