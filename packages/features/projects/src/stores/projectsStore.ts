import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { Project, CreateProjectDto, ProjectListResponse } from '@code-pilot/types';
import { fileService } from '@code-pilot/core';
import { projectStorage } from '@code-pilot/services';

interface ProjectsState {
  // State
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchValue: string;
  selectedProject: Project | null;
  createDialogOpen: boolean;
  templateDialogOpen: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  createProject: (dto: CreateProjectDto) => Promise<Project>;
  openProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  setSearchValue: (value: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setTemplateDialogOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
  // Initial state
  projects: [],
  loading: false,
  error: null,
  searchValue: '',
  selectedProject: null,
  createDialogOpen: false,
  templateDialogOpen: false,
  
  // Actions
  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await invoke<ProjectListResponse>('list_projects');
      set({ projects: response.projects, loading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load projects';
      set({ error, loading: false });
      throw err;
    }
  },
  
  createProject: async (dto: CreateProjectDto) => {
    try {
      const project = await invoke<Project>('create_project', { dto });
      set(state => ({ 
        projects: [project, ...state.projects],
        createDialogOpen: false 
      }));
      return project;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create project';
      set({ error });
      throw err;
    }
  },
  
  openProject: async (project: Project) => {
    try {
      await invoke<Project>('open_project', { id: project.id });
      // Set the file service root path
      fileService.setRootPath(project.path);
      set({ selectedProject: project });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to open project';
      set({ error });
      throw err;
    }
  },
  
  deleteProject: async (projectId: string) => {
    try {
      await invoke('delete_project', { id: projectId });
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete project';
      set({ error });
      throw err;
    }
  },
  
  updateProject: async (projectId: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await invoke<Project>('update_project', { 
        id: projectId, 
        updates 
      });
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId ? updatedProject : p
        ),
        selectedProject: state.selectedProject?.id === projectId 
          ? updatedProject 
          : state.selectedProject
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update project';
      set({ error });
      throw err;
    }
  },
  
  setSearchValue: (searchValue: string) => set({ searchValue }),
  
  setSelectedProject: (selectedProject: Project | null) => set({ selectedProject }),
  
  setCreateDialogOpen: (createDialogOpen: boolean) => set({ createDialogOpen }),
  
  setTemplateDialogOpen: (templateDialogOpen: boolean) => set({ templateDialogOpen }),
  
  setError: (error: string | null) => set({ error }),
  
  clearError: () => set({ error: null })
    }),
    {
      name: 'projects-ui-state',
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        searchValue: state.searchValue,
      }),
    }
  )
);