import React, { useState } from 'react';
import { StartProjectDialog } from '@code-pilot/feature-templates';
import { Button } from '@code-pilot/ui-kit';
import { Plus, Sparkles } from 'lucide-react';
import { useTemplates } from './hooks/useTemplates';
import { templates as templateData } from './data/templates';
import { useNavigate } from 'react-router-dom';
import { Template } from '@code-pilot/feature-templates';

export function TemplatesPage() {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const navigate = useNavigate();
  const {
    createProjectFromTemplate,
    openFolder,
    cloneRepository,
  } = useTemplates();

  const handleCreateProject = async (template: Template, options: any) => {
    try {
      const project = await createProjectFromTemplate(template, options);
      
      // Navigate to the project
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      // In a real app, show a toast or error message
    }
  };

  const handleOpenFolder = async () => {
    try {
      const project = await openFolder();
      if (project) {
        navigate(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const handleCloneRepo = async () => {
    try {
      await cloneRepository();
    } catch (error) {
      console.error('Failed to clone repository:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Start New Project</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose from our collection of templates to kickstart your next project
            </p>
          </div>
          <Button onClick={() => setShowStartDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ready to create something amazing?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse our curated collection of templates or start from scratch with your own project.
            </p>
            <Button size="lg" onClick={() => setShowStartDialog(true)}>
              <Sparkles className="w-5 h-5 mr-2" />
              Browse Templates
            </Button>
          </div>

          {/* Featured Templates Preview */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Popular Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templateData.slice(0, 6).map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setShowStartDialog(true)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.icon && (
                      <span className="text-2xl">{getTemplateIcon(template.icon)}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex gap-1 mt-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-muted rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Start Project Dialog */}
      <StartProjectDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        templates={templateData}
        onCreateProject={handleCreateProject}
        onOpenFolder={handleOpenFolder}
        onCloneRepo={handleCloneRepo}
      />
    </div>
  );
}

// Helper function to get icon
function getTemplateIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    react: '⚛️',
    vue: '💚',
    angular: '🅰️',
    svelte: '🔥',
    solid: '⚡',
    nextjs: '▲',
    nuxt: '💚',
    remix: '💿',
    astro: '🚀',
    tauri: '🦀',
    electron: '⚛️',
    express: '🚂',
    nestjs: '🐈',
    django: '🐍',
    flask: '🍶',
    fastapi: '⚡',
    go: '🐹',
    rust: '🦀',
  };
  
  return iconMap[icon] || '📦';
}