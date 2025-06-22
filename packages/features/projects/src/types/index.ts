// Re-export project types from @code-pilot/types
export type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectListResponse,
  ProjectSettings,
  ProjectValidation,
  ProjectQuery,
  ProjectEventPayload
} from '@code-pilot/types';

export { ProjectEvent } from '@code-pilot/types';

// Re-export template types
export type {
  ProjectTemplate,
  TemplateCategory,
  TemplateType,
  TemplateColor,
  ProjectCreationOptions,
  PrerequisiteCheck,
  TemplateExecutionResult,
  TemplateSearchFilters,
  TemplateGroup
} from '@code-pilot/types';