import { useMemo } from 'react';
import { useTemplatesStore } from '../stores/templatesStore';
import { Template, TemplateCategory, TemplateFilter } from '../types';

export const useTemplates = () => {
  const templates = useTemplatesStore(state => state.templates);
  const filter = useTemplatesStore(state => state.filter);
  const isLoading = useTemplatesStore(state => state.isLoading);
  const error = useTemplatesStore(state => state.error);
  const loadTemplates = useTemplatesStore(state => state.loadTemplates);
  const setFilter = useTemplatesStore(state => state.setFilter);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Filter by category
      if (filter.category && template.category !== filter.category) {
        return false;
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every(tag => 
          template.tags.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      // Filter by search
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(searchLower);
        const matchesDescription = template.description.toLowerCase().includes(searchLower);
        const matchesTags = template.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [templates, filter]);

  const categories = useMemo(() => {
    const categorySet = new Set<TemplateCategory>();
    templates.forEach(template => {
      categorySet.add(template.category);
    });
    return Array.from(categorySet);
  }, [templates]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [templates]);

  return {
    templates: filteredTemplates,
    allTemplates: templates,
    categories,
    allTags,
    filter,
    isLoading,
    error,
    loadTemplates,
    setFilter
  };
};