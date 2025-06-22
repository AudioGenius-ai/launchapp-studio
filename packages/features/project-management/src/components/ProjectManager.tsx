import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { useProjectManagementStore } from '../stores';
import { TaskBoard } from './TaskBoard';
import { DocumentList } from './DocumentList';
import { SprintManager } from './SprintManager';
import { ProjectSettings } from './ProjectSettings';
import { CreateTaskDialog } from './CreateTaskDialog';
import { CreateDocumentDialog } from './CreateDocumentDialog';
import { CreateSprintDialog } from './CreateSprintDialog';
import { TaskDetail } from './TaskDetail';
import { DocumentEditor } from './DocumentEditor';

export const ProjectManager: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    currentProject,
    activeSection,
    sidebarExpanded,
    selectedTaskId,
    selectedDocumentId,
    isLoading,
    error,
    loadProject,
    loadTasks,
    loadDocuments,
    loadSprints,
    loadStatistics,
    setActiveSection,
    setSidebarExpanded,
  } = useProjectManagementStore();

  const [showCreateTask, setShowCreateTask] = React.useState(false);
  const [showCreateDocument, setShowCreateDocument] = React.useState(false);
  const [showCreateSprint, setShowCreateSprint] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      loadTasks(projectId);
      loadDocuments(projectId);
      loadSprints(projectId);
      loadStatistics(projectId);
    }
  }, [projectId]);

  if (isLoading && !currentProject) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-foregroundSecondary)' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p style={{ color: 'var(--color-foregroundSecondary)' }}>Project not found</p>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'tasks', label: 'Tasks', icon: FolderOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'sprints', label: 'Sprints', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderMainContent = () => {
    switch (activeSection) {
      case 'tasks':
        return <TaskBoard projectId={projectId!} />;
      case 'documents':
        return <DocumentList projectId={projectId!} />;
      case 'sprints':
        return <SprintManager projectId={projectId!} />;
      case 'settings':
        return <ProjectSettings project={currentProject} />;
      default:
        return <TaskBoard projectId={projectId!} />;
    }
  };

  const getCreateDialog = () => {
    switch (activeSection) {
      case 'tasks':
        return showCreateTask && (
          <CreateTaskDialog
            projectId={projectId!}
            isOpen={showCreateTask}
            onClose={() => setShowCreateTask(false)}
          />
        );
      case 'documents':
        return showCreateDocument && (
          <CreateDocumentDialog
            projectId={projectId!}
            isOpen={showCreateDocument}
            onClose={() => setShowCreateDocument(false)}
          />
        );
      case 'sprints':
        return showCreateSprint && (
          <CreateSprintDialog
            projectId={projectId!}
            isOpen={showCreateSprint}
            onClose={() => setShowCreateSprint(false)}
          />
        );
      default:
        return null;
    }
  };

  const handleCreate = () => {
    switch (activeSection) {
      case 'tasks':
        setShowCreateTask(true);
        break;
      case 'documents':
        setShowCreateDocument(true);
        break;
      case 'sprints':
        setShowCreateSprint(true);
        break;
    }
  };

  return (
    <div className="h-full w-full flex" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div 
        className={`transition-all duration-200 flex flex-col border-r ${
          sidebarExpanded ? 'w-64' : 'w-12'
        }`}
        style={{ 
          backgroundColor: 'var(--color-backgroundSecondary)', 
          borderColor: 'var(--color-border)' 
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          {sidebarExpanded && (
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
                {currentProject.name}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-foregroundSecondary)' }}>
                {currentProject.key}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center p-2 rounded mb-1 transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!sidebarExpanded ? item.label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {sidebarExpanded && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
              {sidebarItems.find(item => item.id === activeSection)?.label}
            </h1>
            
            {/* Search */}
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                style={{ color: 'var(--color-foregroundSecondary)' }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Button */}
            <button
              className="p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
              title="Filter"
            >
              <Filter size={16} />
            </button>

            {/* Create Button */}
            {activeSection !== 'settings' && (
              <button
                onClick={handleCreate}
                className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Create
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Side Panel for Details */}
      {(selectedTaskId || selectedDocumentId) && (
        <div 
          className="w-96 border-l flex flex-col"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          {selectedTaskId && (
            <TaskDetail taskId={selectedTaskId} projectId={projectId!} />
          )}
          {selectedDocumentId && (
            <DocumentEditor documentId={selectedDocumentId} projectId={projectId!} />
          )}
        </div>
      )}

      {/* Create Dialogs */}
      {getCreateDialog()}
    </div>
  );
};