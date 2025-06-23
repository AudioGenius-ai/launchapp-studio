// Export all types from templates.ts
export * from './templates';

// Import types we need for local interfaces
import type { TemplateCategory } from './templates';

// Keep existing types that aren't in templates.ts
export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

export interface TemplateVariable {
  name: string;
  description?: string;
  default?: string;
  required?: boolean;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  tags?: string[];
  search?: string;
}

export interface CreateProjectOptions {
  templateId: string;
  projectName: string;
  projectPath: string;
  overrides?: Record<string, any>;
}

// Re-export enums as values
export { TemplateCategory, TemplateType } from './templates';

// Re-export types
export type {
  Template,
  ProjectTemplate,
  TemplateColor,
  PrerequisiteCheck,
  ProjectCreationOptions,
  TemplateExecutionResult,
  TemplateSearchFilters,
  TemplateGroup
} from './templates';