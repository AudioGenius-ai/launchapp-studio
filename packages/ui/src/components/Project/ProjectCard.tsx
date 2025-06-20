import React from 'react';
import { Project } from '@code-pilot/types';
import { Folder, GitBranch, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  onEdit,
  onDelete,
  className
}) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className={cn(
        "relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "p-6 hover:shadow-lg transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={() => onOpen?.(project)}
    >
      {/* Project Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        {/* Actions Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[160px] bg-white dark:bg-gray-800 rounded-md p-1 shadow-lg border border-gray-200 dark:border-gray-700"
              sideOffset={5}
            >
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.(project);
                }}
              >
                Open Project
              </DropdownMenu.Item>
              
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project);
                }}
              >
                Edit Project
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
              
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project);
                }}
              >
                Delete Project
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Project Name */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {project.name}
      </h3>

      {/* Project Description */}
      {project.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Project Path */}
      <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 truncate font-mono">
        {project.path}
      </p>

      {/* Project Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          {project.settings.gitEnabled && (
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span>{project.settings.defaultBranch}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};