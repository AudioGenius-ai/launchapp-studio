import React, { useMemo } from 'react';
import { Template, TemplateCategory } from '../types';
import { TemplateCard } from './TemplateCard';
import { cn } from '@code-pilot/utils';

interface TemplateGridProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
  selectedCategory?: TemplateCategory | 'all';
  searchQuery?: string;
  className?: string;
}

export function TemplateGrid({
  templates,
  onTemplateSelect,
  selectedCategory = 'all',
  searchQuery = '',
  className,
}: TemplateGridProps) {
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (t.config?.framework && t.config.framework.toLowerCase().includes(query)) ||
          (t.config?.features && t.config.features.some((s) => s.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  if (filteredTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {searchQuery
            ? `No templates match "${searchQuery}". Try a different search term.`
            : 'No templates available in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
    >
      {filteredTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onTemplateSelect(template)}
        />
      ))}
    </div>
  );
}