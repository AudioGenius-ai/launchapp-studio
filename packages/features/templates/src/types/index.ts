export interface Template {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: TemplateCategory;
  tags: string[];
  repository?: string;
  author?: string;
  version?: string;
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  files?: TemplateFile[];
  config?: TemplateConfig;
}

export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

export interface TemplateConfig {
  framework?: string;
  language?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  features?: string[];
  env?: Record<string, string>;
}

export enum TemplateCategory {
  React = 'react',
  Vue = 'vue',
  Angular = 'angular',
  Svelte = 'svelte',
  NextJS = 'nextjs',
  Remix = 'remix',
  Vite = 'vite',
  Node = 'node',
  Express = 'express',
  NestJS = 'nestjs',
  Python = 'python',
  Django = 'django',
  Flask = 'flask',
  FastAPI = 'fastapi',
  Rust = 'rust',
  Go = 'go',
  Java = 'java',
  Spring = 'spring',
  Mobile = 'mobile',
  Desktop = 'desktop',
  CLI = 'cli',
  Library = 'library',
  Monorepo = 'monorepo',
  Other = 'other'
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
  overrides?: Partial<TemplateConfig>;
}