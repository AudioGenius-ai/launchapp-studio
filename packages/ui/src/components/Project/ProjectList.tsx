import React from 'react';
import { Project } from '@code-pilot/types';
import { ProjectCard } from './ProjectCard';
import { Search, FolderPlus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  onProjectOpen?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  onCreateProject?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading = false,
  onProjectOpen,
  onProjectEdit,
  onProjectDelete,
  onCreateProject,
  searchValue = '',
  onSearchChange,
  className
}) => {
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.path.toLowerCase().includes(searchValue.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Projects
        </h2>
        
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Project Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading projects...
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <FolderPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchValue ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {searchValue 
              ? 'Try adjusting your search criteria' 
              : 'Create your first project to get started'
            }
          </p>
          {!searchValue && onCreateProject && (
            <button
              onClick={onCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={onProjectOpen}
              onEdit={onProjectEdit}
              onDelete={onProjectDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};