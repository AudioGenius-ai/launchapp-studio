import { useProjectManagementStore } from '../stores';

// Hook for easy access to project management functionality
export const useProjectManagement = (projectId?: string) => {
  const store = useProjectManagementStore();
  
  return {
    ...store,
    // Convenience methods for common operations
    refreshProject: async () => {
      if (projectId) {
        await Promise.all([
          store.loadProject(projectId),
          store.loadTasks(projectId),
          store.loadDocuments(projectId),
          store.loadSprints(projectId),
          store.loadStatistics(projectId),
        ]);
      }
    },
  };
};

export { useProjectManagementStore } from '../stores';