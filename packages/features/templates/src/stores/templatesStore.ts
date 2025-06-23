import { create } from 'zustand';
import { Template, TemplateCategory, TemplateFilter, CreateProjectOptions } from '../types';

interface TemplatesState {
  templates: Template[];
  selectedTemplate: Template | null;
  filter: TemplateFilter;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: Template | null) => void;
  setFilter: (filter: TemplateFilter) => void;
  createProject: (options: CreateProjectOptions) => Promise<void>;
  importTemplate: (url: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'A modern React application with Vite, TypeScript, and Tailwind CSS',
    category: TemplateCategory.React,
    tags: ['react', 'vite', 'typescript', 'tailwind'],
    icon: '⚛️',
    config: {
      framework: 'react',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['typescript', 'tailwind', 'eslint', 'prettier']
    }
  },
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Full-stack React framework with App Router and TypeScript',
    category: TemplateCategory.FullStack,
    tags: ['nextjs', 'react', 'typescript', 'app-router'],
    icon: '▲',
    config: {
      framework: 'nextjs',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['app-router', 'typescript', 'tailwind', 'eslint']
    }
  },
  {
    id: 'vue-vite',
    name: 'Vue 3 + Vite',
    description: 'Vue 3 application with Composition API and TypeScript',
    category: TemplateCategory.Vue,
    tags: ['vue', 'vite', 'typescript', 'composition-api'],
    icon: '🟢',
    config: {
      framework: 'vue',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['typescript', 'pinia', 'vue-router', 'eslint']
    }
  },
  {
    id: 'node-express',
    name: 'Express API',
    description: 'Node.js REST API with Express and TypeScript',
    category: TemplateCategory.Backend,
    tags: ['node', 'express', 'typescript', 'api'],
    icon: '🚀',
    config: {
      framework: 'express',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['typescript', 'eslint', 'jest', 'swagger']
    }
  },
  {
    id: 'python-fastapi',
    name: 'FastAPI',
    description: 'Modern Python web API with automatic OpenAPI docs',
    category: TemplateCategory.Backend,
    tags: ['python', 'fastapi', 'api', 'async'],
    icon: '🐍',
    config: {
      framework: 'fastapi',
      language: 'python',
      packageManager: 'pip',
      features: ['uvicorn', 'pydantic', 'pytest', 'black']
    }
  },
  {
    id: 'rust-cli',
    name: 'Rust CLI',
    description: 'Command-line application with clap and tokio',
    category: TemplateCategory.Tooling,
    tags: ['rust', 'cli', 'clap', 'tokio'],
    icon: '🦀',
    config: {
      framework: 'cli',
      language: 'rust',
      packageManager: 'cargo',
      features: ['clap', 'tokio', 'serde', 'reqwest']
    }
  },
  {
    id: 'tauri-app',
    name: 'Tauri Desktop App',
    description: 'Cross-platform desktop app with Tauri and React',
    category: TemplateCategory.Desktop,
    tags: ['tauri', 'react', 'rust', 'desktop'],
    icon: '🖥️',
    config: {
      framework: 'tauri',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['react', 'typescript', 'tailwind', 'tauri-plugins']
    }
  },
  {
    id: 'monorepo-turborepo',
    name: 'Turborepo Monorepo',
    description: 'Monorepo setup with Turborepo, TypeScript, and pnpm workspaces',
    category: TemplateCategory.Tooling,
    tags: ['monorepo', 'turborepo', 'typescript', 'pnpm'],
    icon: '📦',
    config: {
      framework: 'turborepo',
      language: 'typescript',
      packageManager: 'pnpm',
      features: ['turborepo', 'typescript', 'changesets', 'eslint']
    }
  }
];

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: defaultTemplates,
  selectedTemplate: null,
  filter: {},
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      // In the future, this could load from a remote source or local config
      // For now, we use the default templates
      set({ templates: defaultTemplates, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectTemplate: (template) => {
    set({ selectedTemplate: template });
  },

  setFilter: (filter) => {
    set({ filter });
  },

  createProject: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      
      // Find the template
      const template = get().templates.find(t => t.id === options.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create the project directory
      await invoke('create_directory', { path: options.projectPath });

      // Initialize the project based on the template
      // This would be expanded to actually create files based on the template
      await invoke('write_file', {
        path: `${options.projectPath}/package.json`,
        content: JSON.stringify({
          name: options.projectName,
          version: '0.1.0',
          description: `Project created from ${template.name} template`,
          scripts: template.scripts || {},
          dependencies: template.dependencies || {},
          ...options.overrides
        }, null, 2)
      });

      // Create README
      await invoke('write_file', {
        path: `${options.projectPath}/README.md`,
        content: `# ${options.projectName}\n\nCreated with ${template.name} template.\n\n${template.description}`
      });

      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  importTemplate: async (url) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement template import from URL
      // This would fetch template definition from a remote source
      throw new Error('Template import not implemented yet');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  refreshTemplates: async () => {
    await get().loadTemplates();
  }
}));