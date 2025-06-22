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
    <div className={cn("w-full", className)}>
      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-12 pr-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder:text-gray-500 dark:placeholder:text-gray-400
                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400
                     transition-all duration-200"
          />
        </div>
      )}

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 && searchValue ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            No projects match your search for "{searchValue}"
          </p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      ) : null}
    </div>
  );
};