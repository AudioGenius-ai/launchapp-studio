// Template-related type definitions

export enum TemplateCategory {
  React = 'react',
  Vue = 'vue',
  Angular = 'angular',
  Svelte = 'svelte',
  FullStack = 'fullstack',
  Static = 'static',
  Mobile = 'mobile',
  Desktop = 'desktop',
  Library = 'library',
  Tooling = 'tooling',
  Backend = 'backend',
  Framework = 'framework',
  Tool = 'tool',
  Starter = 'starter',
  Premium = 'premium',
  Other = 'other'
}

export enum TemplateType {
  Create = 'create',
  Clone = 'clone',
  Download = 'download',
  Vite = 'vite',
  Vercel = 'vercel',
  Tauri = 'tauri',
  Custom = 'custom'
}

export interface TemplateColor {
  primary?: string;
  secondary?: string;
  from?: string;
  to?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type?: TemplateType;
  command?: string;
  repository?: string;
  repoUrl?: string;
  docsUrl?: string;
  demoUrl?: string;
  isPremium?: boolean;
  hasProjectName?: boolean;
  tags: string[];
  icon: string;
  framework?: string;
  stack?: string[];
  color?: TemplateColor;
  config?: {
    framework: string;
    language: string;
    packageManager: string;
    features: string[];
  };
  features?: string[];
  prerequisites?: string[];
  setupSteps?: string[];
  author?: string;
  version?: string;
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

// Alias for backward compatibility
export type ProjectTemplate = Template;

export interface PrerequisiteCheck {
  name: string;
  command: string;
  expectedOutput?: string;
  required: boolean;
}

export interface ProjectCreationOptions {
  templateId: string;
  projectName: string;
  projectPath: string;
  config?: Record<string, any>;
}

export interface TemplateExecutionResult {
  success: boolean;
  projectPath?: string;
  error?: string;
  logs?: string[];
}

export interface TemplateSearchFilters {
  category?: TemplateCategory;
  tags?: string[];
  searchTerm?: string;
}

export interface TemplateGroup {
  category: TemplateCategory;
  templates: Template[];
}