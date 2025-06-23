import React from 'react';
import { Template } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@code-pilot/ui-kit';
import { Badge } from '@code-pilot/ui-kit';
import { cn } from '@code-pilot/utils';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
  className?: string;
}

export function TemplateCard({ template, onClick, className }: TemplateCardProps) {
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
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
        'flex flex-col h-full bg-card border-muted',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">{template.name}</h3>
            {template.config?.framework && (
              <p className="text-xs text-muted-foreground mt-1">{template.config.framework}</p>
            )}
          </div>
          {template.icon && (
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: bgColor }}
            >
              {getTemplateIcon(template.icon)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 py-2">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
        
        {template.config?.features && template.config.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.config.features.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {template.config.features.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                +{template.config.features.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {template.author && (
            <span className="text-[10px] text-muted-foreground">
              by {template.author}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
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
    // Add more as needed
  };
  
  return iconMap[icon] || '📦';
}