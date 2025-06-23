import React from 'react';
import { Template } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-pilot/ui-kit';
import { Button } from '@code-pilot/ui-kit';
import { Badge } from '@code-pilot/ui-kit';
import { ExternalLink, Github, Globe, Book, Terminal } from 'lucide-react';
import { ScrollArea } from '@code-pilot/ui-kit';

interface TemplatePreviewProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: () => void;
}

export function TemplatePreview({
  template,
  open,
  onOpenChange,
  onUseTemplate,
}: TemplatePreviewProps) {
  const iconColors: Record<string, string> = {
    react: '#61DAFB',
    vue: '#4FC08D',
    angular: '#DD0031',
    nextjs: '#000000',
    express: '#000000',
    fastapi: '#009688',
    rust: '#CE4A1F',
    tauri: '#24C8DB',
  };
  
  const bgColor = template.config?.framework 
    ? iconColors[template.config.framework] || '#6B7280'
    : '#6B7280';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {template.icon && (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0"
                style={{ backgroundColor: bgColor }}
              >
                {getTemplateIcon(template.icon)}
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
              {template.author && (
                <p className="text-sm text-muted-foreground mt-1">by {template.author}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="my-6 max-h-[400px]">
          <div className="space-y-6">
            {/* Repository */}
            {template.repository && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Repository</h4>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <code className="flex-1">{template.repository}</code>
                </div>
              </div>
            )}

            {/* Features */}
            {template.config?.features && template.config.features.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {template.config.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {template.dependencies && Object.keys(template.dependencies).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Dependencies</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(template.dependencies).slice(0, 6).map(([name, version]) => (
                    <div key={name} className="text-sm font-mono text-muted-foreground">
                      {name}: {version}
                    </div>
                  ))}
                  {Object.keys(template.dependencies).length > 6 && (
                    <div className="text-sm text-muted-foreground col-span-2">
                      ...and {Object.keys(template.dependencies).length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Package Manager */}
            {template.config?.packageManager && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Package Manager</h4>
                <Badge variant="outline">{template.config.packageManager}</Badge>
              </div>
            )}

            {/* Version */}
            {template.version && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Version</h4>
                <Badge variant="outline">{template.version}</Badge>
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUseTemplate}>
            <Terminal className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get icon (could be expanded with actual icon components)
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
    reactnative: '📱',
    expo: '📱',
    tailwind: '🎨',
    eslint: '🔍',
    prettier: '✨',
    vitest: '🧪',
    playwright: '🎭',
    turborepo: '🔄',
    nx: '🔷',
    hono: '🔥',
    // Add more as needed
  };
  
  return iconMap[icon] || '📦';
}