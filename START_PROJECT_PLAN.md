# Start Project Feature Implementation Plan

## Overview
Implement a comprehensive project template system that allows users to quickly start new projects from a variety of pre-configured templates, similar to the previous IDE but with improvements.

## Architecture Design

### 1. Template System Structure

```
packages/
├── types/src/
│   └── templates.ts          # Template interfaces and types
├── core/src/services/
│   └── templateService.ts    # Template management logic
└── ui/src/components/
    ├── StartProject/         # UI components
    │   ├── StartProjectDialog.tsx
    │   ├── TemplateGrid.tsx
    │   ├── TemplateCard.tsx
    │   ├── TemplatePreview.tsx
    │   └── ProjectCreationWizard.tsx
    └── Templates/
        └── index.tsx         # Re-exports

apps/desktop/
├── src/features/templates/   # Feature module
│   ├── TemplatesPage.tsx
│   ├── hooks/
│   │   └── useTemplates.ts
│   └── data/
│       ├── templates.ts      # Template definitions
│       └── logos.ts          # Logo mappings
└── src-tauri/src/commands/
    └── template_commands.rs  # Rust command handlers
```

### 2. Core Components

#### A. Template Types (`packages/types/src/templates.ts`)
```typescript
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  tags: string[];
  
  // Execution
  command: string;
  hasProjectName?: boolean;
  postCreateCommand?: string;
  
  // UI
  icon?: string;
  logo?: string;
  color?: TemplateColor;
  
  // Metadata
  author?: string;
  version?: string;
  framework?: string;
  stack?: string[];
  
  // Links
  repoUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  
  // Features
  features?: string[];
  prerequisites?: string[];
  isPremium?: boolean;
}

export enum TemplateCategory {
  Starter = 'starter',
  Framework = 'framework',
  FullStack = 'fullstack',
  Desktop = 'desktop',
  Mobile = 'mobile',
  Backend = 'backend',
  Tool = 'tool',
  Premium = 'premium'
}

export enum TemplateType {
  Vercel = 'vercel',
  Vite = 'vite',
  Tauri = 'tauri',
  Create = 'create',
  Custom = 'custom',
  Community = 'community'
}

export interface TemplateColor {
  from: string;
  to: string;
  direction?: string;
}

export interface ProjectCreationOptions {
  template: ProjectTemplate;
  projectName: string;
  projectPath: string;
  gitInit?: boolean;
  installDependencies?: boolean;
  openInEditor?: boolean;
}
```

#### B. Template Service (`packages/core/src/services/templateService.ts`)
```typescript
export class TemplateService {
  private templates: ProjectTemplate[] = [];
  
  async loadTemplates(): Promise<ProjectTemplate[]>;
  async getTemplateById(id: string): Promise<ProjectTemplate | null>;
  async getTemplatesByCategory(category: TemplateCategory): Promise<ProjectTemplate[]>;
  async searchTemplates(query: string): Promise<ProjectTemplate[]>;
  
  async createProjectFromTemplate(options: ProjectCreationOptions): Promise<Project>;
  async validateTemplate(template: ProjectTemplate): Promise<boolean>;
  async checkPrerequisites(template: ProjectTemplate): Promise<PrerequisiteCheck[]>;
  
  // Template management
  async addCustomTemplate(template: ProjectTemplate): Promise<void>;
  async removeCustomTemplate(id: string): Promise<void>;
  async importTemplateFromUrl(url: string): Promise<ProjectTemplate>;
}
```

### 3. UI Components Design

#### A. Start Project Dialog
- Tabbed interface:
  - **Templates**: Browse and search templates
  - **Recent**: Recently used templates
  - **Custom**: User-defined templates
  - **Import**: Import template from URL/file

#### B. Template Grid
- Filterable by category, type, framework
- Search functionality
- Sort options (popular, recent, alphabetical)
- Visual cards with gradients and logos

#### C. Template Preview
- Full template details
- README preview
- Tech stack visualization
- Links to demo/repo/docs
- Prerequisites check
- "Use Template" action

#### D. Project Creation Wizard
- Step 1: Project name and location
- Step 2: Configuration options (if applicable)
- Step 3: Additional setup (git, dependencies)
- Real-time command output
- Progress tracking
- Error handling

### 4. Backend Implementation

#### A. Rust Commands
```rust
#[tauri::command]
pub async fn get_templates() -> Result<Vec<Template>, String>;

#[tauri::command]
pub async fn create_project_from_template(
    options: ProjectCreationOptions,
    window: Window
) -> Result<Project, String>;

#[tauri::command]
pub async fn check_command_availability(
    command: String
) -> Result<bool, String>;

#[tauri::command]
pub async fn execute_template_command(
    command: String,
    cwd: String,
    window: Window
) -> Result<(), String>;
```

### 5. Template Data Structure

```typescript
// Example template
{
  id: "nextjs-app-router",
  name: "Next.js App Router",
  description: "Full-stack React framework with App Router",
  category: TemplateCategory.Framework,
  type: TemplateType.Vercel,
  command: "npx create-next-app@latest",
  hasProjectName: true,
  tags: ["react", "nextjs", "typescript", "tailwind"],
  icon: "nextjs",
  color: {
    from: "#000000",
    to: "#434343"
  },
  framework: "nextjs",
  stack: ["React", "TypeScript", "Tailwind CSS"],
  features: [
    "App Router",
    "Server Components",
    "API Routes",
    "TypeScript",
    "Tailwind CSS",
    "ESLint"
  ],
  prerequisites: ["node >= 18.17.0"],
  repoUrl: "https://github.com/vercel/next.js",
  docsUrl: "https://nextjs.org/docs"
}
```

### 6. Implementation Phases

#### Phase 1: Core Infrastructure (Week 1)
- [ ] Define TypeScript interfaces and types
- [ ] Implement template service
- [ ] Create Rust command handlers
- [ ] Set up template data structure

#### Phase 2: UI Components (Week 2)
- [ ] Build StartProjectDialog component
- [ ] Create TemplateGrid with filtering
- [ ] Implement TemplateCard component
- [ ] Add TemplatePreview modal

#### Phase 3: Project Creation (Week 3)
- [ ] Build ProjectCreationWizard
- [ ] Implement command execution with streaming
- [ ] Add progress tracking
- [ ] Handle errors and edge cases

#### Phase 4: Integration (Week 4)
- [ ] Integrate with project management
- [ ] Add to main navigation
- [ ] Implement keyboard shortcuts
- [ ] Add telemetry/analytics

#### Phase 5: Polish & Templates (Week 5)
- [ ] Add 50+ template definitions
- [ ] Create logo/icon system
- [ ] Add animations and transitions
- [ ] Implement template search

### 7. Key Features

1. **Rich Template Library**: 50+ templates across all categories
2. **Smart Search**: Full-text search with tags and filters
3. **Visual Preview**: See what you're creating before you start
4. **Real-time Output**: Watch project creation in progress
5. **Prerequisite Checking**: Ensure required tools are installed
6. **Custom Templates**: Add your own templates
7. **Quick Actions**: Keyboard shortcuts for common templates
8. **Project Management**: Auto-add to recent projects
9. **Configuration Options**: Customize template settings
10. **Offline Support**: Cache template data locally

### 8. Improvements Over v1

1. **Template Versioning**: Track and update template versions
2. **Multi-step Wizards**: Complex templates with configuration
3. **Dependency Resolution**: Auto-install missing tools
4. **Template Marketplace**: Community template sharing
5. **AI Suggestions**: Recommend templates based on usage
6. **Batch Operations**: Create multiple projects at once
7. **Template Composition**: Combine multiple templates
8. **Post-create Scripts**: Run setup after creation
9. **Environment Setup**: Configure env variables
10. **Docker Integration**: Containerized templates

### 9. Testing Strategy

1. **Unit Tests**: Service logic and utilities
2. **Component Tests**: UI component behavior
3. **Integration Tests**: Full creation flow
4. **E2E Tests**: User workflows
5. **Performance Tests**: Large template lists

### 10. Success Metrics

1. Time to create first project < 30 seconds
2. Template search results < 100ms
3. 95% success rate for project creation
4. Support for 50+ templates at launch
5. User satisfaction > 4.5/5

## Next Steps

1. Review and approve plan
2. Create feature branch
3. Begin Phase 1 implementation
4. Set up weekly progress reviews