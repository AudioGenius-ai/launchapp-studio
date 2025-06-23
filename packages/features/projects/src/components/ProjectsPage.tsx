import { useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useNavigate } from 'react-router-dom';
import { CompactThemeSwitcher } from '@code-pilot/themes';
import { StartProjectDialog, Template } from '@code-pilot/feature-templates';
import { Project, CreateProjectDto } from '@code-pilot/types';
import { Plus, FolderOpen, Sparkles, Zap, Code2, GitBranch, FolderPlus, Command, Settings } from 'lucide-react';
import { templates as templateData } from '../templates/data/templates';
import { useTemplates } from '../templates/hooks/useTemplates';
import { useProjectsStore } from '../stores/projectsStore';
import { ProjectList } from './ProjectList';
import { CreateProjectDialog } from './CreateProjectDialog';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { createProjectFromTemplate, openFolder, cloneRepository } = useTemplates();
  
  const {
    projects,
    loading,
    error,
    searchValue,
    createDialogOpen,
    templateDialogOpen,
    selectedProject,
    loadProjects,
    createProject,
    openProject,
    deleteProject,
    setSearchValue,
    setCreateDialogOpen,
    setTemplateDialogOpen,
    setSelectedProject,
    clearError
  } = useProjectsStore();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (dto: CreateProjectDto) => {
    try {
      await createProject(dto);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleOpenProject = async (project: Project) => {
    try {
      await openProject(project);
      // Navigate to the project window route
      // For now, we'll use the temporary editor route
      // In the future, this will open a new window with `/project/${project.id}`
      navigate('/editor');
      
      // TODO: When multi-window support is implemented:
      // await invoke('open_project_window', { projectId: project.id });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    // TODO: Open edit dialog
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await deleteProject(project.id);
    } catch (err) {
      // Error is handled by the store
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

  const handleCreateProjectFromTemplate = async (template: Template, options: any) => {
    try {
      const project = await createProjectFromTemplate(template, options);
      // Reload projects list
      await loadProjects();
      // Navigate to the new project
      await handleOpenProject(project);
    } catch (error) {
      console.error('Failed to create project from template:', error);
    }
  };

  const handleOpenFolderFromTemplate = async () => {
    try {
      const project = await openFolder();
      if (project) {
        await loadProjects();
        await handleOpenProject(project);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const handleCloneRepoFromTemplate = async () => {
    try {
      await cloneRepository();
      // TODO: Handle cloned repo
    } catch (error) {
      console.error('Failed to clone repository:', error);
    }
  };

  // Custom empty state
  const EmptyState = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="relative w-full max-w-4xl mx-auto px-6">
        {/* Animated background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon with gradient background */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <FolderOpen size={48} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-yellow-900" />
            </div>
          </div>

          {/* Title and description */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Code Pilot Studio
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-10">
            Start your journey by creating a new project or opening an existing one
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
            <button
              onClick={() => setTemplateDialogOpen(true)}
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              Start New Project
            </button>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              Create Blank
            </button>
            <button
              onClick={handleSelectDirectory}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              <FolderPlus size={20} />
              Open Existing
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Code2 size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Editor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Powerful code editor with syntax highlighting and IntelliSense
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Claude AI assistant to help you code faster and smarter
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <GitBranch size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Git Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Built-in version control with full Git support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      {/* App Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* App Branding */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Command size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Code Pilot Studio</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <CompactThemeSwitcher />
            </div>
          </div>
        </div>
      </header>
      
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Projects
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and organize your development projects
              </p>
            </div>
            <button
              onClick={() => setTemplateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Sparkles size={18} />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="mx-6 lg:mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
            <div className="flex-shrink-0 w-5 h-5 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {!loading && projects.length === 0 && !searchValue ? (
          <EmptyState />
        ) : (
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">
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
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateProject={handleCreateProject}
        onSelectDirectory={handleSelectDirectory}
      />

      <StartProjectDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        templates={templateData}
        onCreateProject={handleCreateProjectFromTemplate}
        onOpenFolder={handleOpenFolderFromTemplate}
        onCloneRepo={handleCloneRepoFromTemplate}
      />
    </div>
  );
};