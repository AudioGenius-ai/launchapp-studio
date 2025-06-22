import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectManagementService } from '../services';
import type {
  Project,
  Task,
  Document,
  Sprint,
  TaskFilter,
  DocumentFilter,
  ViewMode,
  ProjectStatistics,
} from '../types';

interface ProjectManagementState {
  // Current project
  currentProject: Project | null;
  
  // Data
  projects: Project[];
  tasks: Task[];
  documents: Document[];
  sprints: Sprint[];
  statistics: ProjectStatistics | null;
  
  // UI state
  viewMode: ViewMode;
  selectedTaskId: string | null;
  selectedDocumentId: string | null;
  selectedSprintId: string | null;
  taskFilter: TaskFilter;
  documentFilter: DocumentFilter;
  isLoading: boolean;
  error: string | null;
  
  // Sidebar state
  sidebarExpanded: boolean;
  activeSection: 'tasks' | 'documents' | 'sprints' | 'settings';
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedTask: (taskId: string | null) => void;
  setSelectedDocument: (documentId: string | null) => void;
  setSelectedSprint: (sprintId: string | null) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  setDocumentFilter: (filter: DocumentFilter) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setActiveSection: (section: 'tasks' | 'documents' | 'sprints' | 'settings') => void;
  
  // Data loading actions
  loadProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  loadTasks: (projectId: string, filter?: TaskFilter) => Promise<void>;
  loadDocuments: (projectId: string, filter?: DocumentFilter) => Promise<void>;
  loadSprints: (projectId: string) => Promise<void>;
  loadStatistics: (projectId: string) => Promise<void>;
  
  // CRUD actions
  createTask: (projectId: string, task: Partial<Task>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  
  createDocument: (projectId: string, document: Partial<Document>) => Promise<void>;
  updateDocument: (projectId: string, documentId: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (projectId: string, documentId: string) => Promise<void>;
  
  createSprint: (projectId: string, sprint: Partial<Sprint>) => Promise<void>;
  updateSprint: (projectId: string, sprintId: string, updates: Partial<Sprint>) => Promise<void>;
  deleteSprint: (projectId: string, sprintId: string) => Promise<void>;
  
  // Search actions
  searchTasks: (projectId: string, query: string) => Promise<void>;
  searchDocuments: (projectId: string, query: string) => Promise<void>;
  searchAll: (projectId: string, query: string) => Promise<{ tasks: Task[]; documents: Document[] }>;
}

export const useProjectManagementStore = create<ProjectManagementState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      tasks: [],
      documents: [],
      sprints: [],
      statistics: null,
      viewMode: { type: 'kanban', groupBy: 'status' },
      selectedTaskId: null,
      selectedDocumentId: null,
      selectedSprintId: null,
      taskFilter: {},
      documentFilter: {},
      isLoading: false,
      error: null,
      sidebarExpanded: true,
      activeSection: 'tasks',
      
      // UI actions
      setCurrentProject: (project) => set({ currentProject: project }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
      setSelectedDocument: (documentId) => set({ selectedDocumentId: documentId }),
      setSelectedSprint: (sprintId) => set({ selectedSprintId: sprintId }),
      setTaskFilter: (filter) => set({ taskFilter: filter }),
      setDocumentFilter: (filter) => set({ documentFilter: filter }),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
      setActiveSection: (section) => set({ activeSection: section }),
      
      // Data loading actions
      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await projectManagementService.listProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      loadProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const project = await projectManagementService.getProject(projectId);
          set({ currentProject: project, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      loadTasks: async (projectId: string, filter?: TaskFilter) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await projectManagementService.listTasks(projectId, filter);
          set({ tasks, taskFilter: filter || {}, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      loadDocuments: async (projectId: string, filter?: DocumentFilter) => {
        set({ isLoading: true, error: null });
        try {
          const documents = await projectManagementService.listDocuments(projectId, filter);
          set({ documents, documentFilter: filter || {}, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      loadSprints: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const sprints = await projectManagementService.listSprints(projectId);
          set({ sprints, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      loadStatistics: async (projectId: string) => {
        try {
          const statistics = await projectManagementService.getProjectStatistics(projectId);
          set({ statistics });
        } catch (error) {
          console.error('Failed to load statistics:', error);
        }
      },
      
      // CRUD actions
      createTask: async (projectId: string, taskData: Partial<Task>) => {
        set({ isLoading: true, error: null });
        try {
          const newTask = await projectManagementService.createTask(projectId, taskData as any);
          const { tasks } = get();
          set({ tasks: [...tasks, newTask], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateTask: async (projectId: string, taskId: string, updates: Partial<Task>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await projectManagementService.updateTask(projectId, taskId, updates as any);
          const { tasks } = get();
          const updatedTasks = tasks.map(task => task.id === taskId ? updatedTask : task);
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      deleteTask: async (projectId: string, taskId: string) => {
        set({ isLoading: true, error: null });
        try {
          await projectManagementService.deleteTask(projectId, taskId);
          const { tasks } = get();
          const filteredTasks = tasks.filter(task => task.id !== taskId);
          set({ tasks: filteredTasks, selectedTaskId: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      createDocument: async (projectId: string, documentData: Partial<Document>) => {
        set({ isLoading: true, error: null });
        try {
          const newDocument = await projectManagementService.createDocument(projectId, documentData as any);
          const { documents } = get();
          set({ documents: [...documents, newDocument], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateDocument: async (projectId: string, documentId: string, updates: Partial<Document>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedDocument = await projectManagementService.updateDocument(projectId, documentId, updates as any);
          const { documents } = get();
          const updatedDocuments = documents.map(doc => doc.id === documentId ? updatedDocument : doc);
          set({ documents: updatedDocuments, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      deleteDocument: async (projectId: string, documentId: string) => {
        set({ isLoading: true, error: null });
        try {
          await projectManagementService.deleteDocument(projectId, documentId);
          const { documents } = get();
          const filteredDocuments = documents.filter(doc => doc.id !== documentId);
          set({ documents: filteredDocuments, selectedDocumentId: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      createSprint: async (projectId: string, sprintData: Partial<Sprint>) => {
        set({ isLoading: true, error: null });
        try {
          const newSprint = await projectManagementService.createSprint(projectId, sprintData as any);
          const { sprints } = get();
          set({ sprints: [...sprints, newSprint], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateSprint: async (projectId: string, sprintId: string, updates: Partial<Sprint>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSprint = await projectManagementService.updateSprint(projectId, sprintId, updates as any);
          const { sprints } = get();
          const updatedSprints = sprints.map(sprint => sprint.id === sprintId ? updatedSprint : sprint);
          set({ sprints: updatedSprints, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      deleteSprint: async (projectId: string, sprintId: string) => {
        set({ isLoading: true, error: null });
        try {
          await projectManagementService.deleteSprint(projectId, sprintId);
          const { sprints } = get();
          const filteredSprints = sprints.filter(sprint => sprint.id !== sprintId);
          set({ sprints: filteredSprints, selectedSprintId: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // Search actions
      searchTasks: async (projectId: string, query: string) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await projectManagementService.searchTasks(projectId, query);
          set({ tasks, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      searchDocuments: async (projectId: string, query: string) => {
        set({ isLoading: true, error: null });
        try {
          const documents = await projectManagementService.searchDocuments(projectId, query);
          set({ documents, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      searchAll: async (projectId: string, query: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await projectManagementService.searchAll(projectId, query);
          set({ 
            tasks: result.tasks, 
            documents: result.documents, 
            isLoading: false 
          });
          return { tasks: result.tasks, documents: result.documents };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'project-management-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        taskFilter: state.taskFilter,
        documentFilter: state.documentFilter,
        sidebarExpanded: state.sidebarExpanded,
        activeSection: state.activeSection,
      }),
    }
  )
);