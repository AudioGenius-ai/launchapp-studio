import React from 'react';
import { Template } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@code-pilot/ui';
import { Badge } from '@code-pilot/ui';
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
        'cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
        'flex flex-col h-full',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{template.name}</h3>
            {template.config?.framework && (
              <p className="text-sm text-muted-foreground mt-1">{template.config.framework}</p>
            )}
          </div>
          {template.icon && (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md"
              style={{ backgroundColor: bgColor }}
            >
              {getTemplateIcon(template.icon)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        
        {template.config?.features && template.config.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.config.features.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {template.config.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.config.features.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {template.author && (
            <span className="text-xs text-muted-foreground">
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