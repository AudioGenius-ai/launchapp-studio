# @code-pilot/feature-templates

Template management feature for Code Pilot Studio. This package provides components, hooks, and services for managing project templates.

## Features

- **Template Components**: Pre-built UI components for template selection and project creation
- **Template Store**: Zustand-based state management for templates
- **Template Service**: Business logic for template operations
- **Project Creation**: Hooks and utilities for creating projects from templates
- **Built-in Templates**: Curated collection of project templates

## Installation

```bash
pnpm add @code-pilot/feature-templates
```

## Usage

### Components

```tsx
import { StartProjectDialog, TemplateGrid, TemplateCard } from '@code-pilot/feature-templates';

// Use the start project dialog
<StartProjectDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  templates={templates}
  onCreateProject={handleCreateProject}
/>

// Display templates in a grid
<TemplateGrid
  templates={templates}
  onTemplateSelect={handleSelect}
  selectedCategory={category}
  searchQuery={search}
/>
```

### Hooks

```tsx
import { useTemplates, useTemplateCreation } from '@code-pilot/feature-templates';

// Use templates hook
const { 
  templates, 
  filter, 
  setFilter, 
  loadTemplates 
} = useTemplates();

// Use template creation hook
const { 
  create, 
  isCreating, 
  progress, 
  validateProjectName 
} = useTemplateCreation();
```

### Store

```tsx
import { useTemplatesStore } from '@code-pilot/feature-templates';

// Access templates store
const templates = useTemplatesStore(state => state.templates);
const createProject = useTemplatesStore(state => state.createProject);
```

## Built-in Templates

The package includes templates for:
- React (Vite, Create React App)
- Vue 3
- Next.js
- Express API
- FastAPI
- Rust CLI
- Tauri Desktop App
- Turborepo Monorepo

## API

### Types

- `Template`: Main template interface
- `TemplateCategory`: Enum of template categories
- `TemplateConfig`: Configuration options for templates
- `CreateProjectOptions`: Options for project creation

### Components

- `StartProjectDialog`: Main dialog for starting new projects
- `TemplateGrid`: Grid display of templates
- `TemplateCard`: Individual template card
- `TemplatePreview`: Detailed template preview
- `ProjectCreationWizard`: Step-by-step project creation

### Hooks

- `useTemplates()`: Main hook for template management
- `useTemplateCreation()`: Hook for project creation workflow

### Services

- `TemplateService`: Core service for template operations
  - `cloneTemplate()`: Clone a git repository as template
  - `downloadTemplate()`: Download template from URL
  - `createProjectFiles()`: Create project files from template
  - `validateTemplate()`: Validate template structure

## License

MIT