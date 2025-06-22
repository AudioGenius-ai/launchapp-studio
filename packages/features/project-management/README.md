# Project Management Feature Package

A comprehensive project management system for Code Pilot Studio, providing Jira-like task management and Confluence-like document management capabilities.

## Features

### Task Management (Jira-style)
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Creation**: Rich task creation with titles, descriptions, priorities, assignees, and labels
- **Task Details**: Comprehensive task editing with comments, attachments, and custom fields
- **Sprint Management**: Create and manage sprints with task assignments
- **Filtering & Search**: Advanced filtering and full-text search across tasks

### Document Management (Confluence-style)
- **Document Editor**: Rich markdown editor with live preview
- **Templates**: Pre-built templates for various document types (requirements, API docs, meeting notes, etc.)
- **Document Organization**: Tag-based organization with hierarchical structure
- **Version History**: Track document changes over time
- **Permissions**: Fine-grained access control for documents

### Project Organization
- **Project Dashboard**: Overview of project statistics and progress
- **Member Management**: Add and manage project team members
- **Settings**: Customizable workflows, issue types, and priorities
- **Integration**: Seamless integration with Code Pilot Studio's plugin system

## Architecture

### Components
- `ProjectManager`: Main project management interface
- `TaskBoard`: Kanban-style task board with drag-and-drop
- `DocumentList`: Grid/list view of project documents
- `DocumentEditor`: Rich markdown editor with live preview
- Dialog components for creating tasks, documents, and sprints

### State Management
- Zustand store for client-side state management
- Persistent storage for UI preferences
- Real-time updates via Tauri plugin integration

### Backend Integration
- Tauri plugin (`tauri-plugin-project-management`) for Rust backend
- File-based storage with JSON for tasks and MDX for documents
- Full CRUD operations with search and filtering capabilities

## Usage

```tsx
import { ProjectManager } from '@code-pilot/features-project-management';

// In your IDE layout
<ProjectManager />
```

## Data Storage

### Tasks
Stored as JSON files in `~/.launchapp/<project-id>/tasks/<task-id>.json`

### Documents
Stored as MDX files in `~/.launchapp/<project-id>/documents/<document-id>.mdx`

### Project Configuration
Stored in `~/.launchapp/<project-id>/project.json`

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes during development
pnpm dev
```

## Integration

This feature package integrates with:
- Code Pilot Studio's theme system
- File explorer for project navigation
- Search functionality across the IDE
- Settings system for user preferences

## Future Enhancements

- Real-time collaboration
- Advanced reporting and analytics
- Integration with external tools (GitHub, GitLab, etc.)
- Custom field types and workflows
- Automation rules and triggers