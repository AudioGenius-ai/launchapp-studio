import React from 'react';
import { Project } from '@code-pilot/types';
import { ProjectCard } from './ProjectCard';
import { cn } from '@code-pilot/ui-kit';

interface ProjectGridProps {
  projects: Project[];
  onProjectOpen?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  className?: string;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onProjectOpen,
  onProjectEdit,
  onProjectDelete,
  className
}) => {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onProjectOpen}
          onEdit={onProjectEdit}
          onDelete={onProjectDelete}
        />
      ))}
    </div>
  );
};