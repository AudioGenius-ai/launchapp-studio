# Core Package

The core business logic package for Code Pilot Studio v2, implementing clean architecture principles.

## Overview

This package contains all the business logic, domain entities, and use cases that are independent of any UI framework or infrastructure. It follows clean architecture patterns to ensure maintainability and testability.

## Architecture Diagram

```mermaid
graph TB
    subgraph "External Layer"
        UI[UI Components]
        API[API Controllers]
        CLI[CLI Commands]
    end
    
    subgraph "Core Package"
        subgraph "Services"
            PS[ProjectService]
            FS[FileService]
            SS[SessionService]
        end
        
        subgraph "Use Cases"
            UC1[Create Project]
            UC2[Update Project]
            UC3[Delete Project]
            UC4[List Projects]
        end
        
        subgraph "Entities"
            PE[Project Entity]
            SE[Session Entity]
            ME[Message Entity]
        end
        
        subgraph "Interfaces"
            IPR[IProjectRepository]
            IEE[IEventEmitter]
            IAP[IAIProvider]
        end
    end
    
    subgraph "Infrastructure"
        DB[(Database)]
        FileSystem[File System]
        AI[AI Services]
    end
    
    UI --> PS
    API --> PS
    CLI --> FS
    
    PS --> UC1
    PS --> UC2
    PS --> UC3
    PS --> UC4
    
    UC1 --> PE
    UC2 --> PE
    UC3 --> PE
    UC4 --> PE
    
    PS --> IPR
    FS --> IEE
    SS --> IAP
    
    IPR --> DB
    IEE --> FileSystem
    IAP --> AI
    
    style PS fill:#4CAF50
    style PE fill:#2196F3
    style IPR fill:#FF9800
```

## Service Logic Flows

### ProjectService Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant ProjectService
    participant Repository
    participant EventEmitter
    participant Validator

    Client->>ProjectService: createProject(dto)
    ProjectService->>Validator: validate(dto)
    Validator-->>ProjectService: validation result
    
    alt Validation Failed
        ProjectService-->>Client: throw ValidationError
    else Validation Passed
        ProjectService->>ProjectService: new Project(dto)
        ProjectService->>Repository: create(project)
        Repository-->>ProjectService: saved project
        ProjectService->>EventEmitter: emit('project:created', project)
        ProjectService-->>Client: return project
    end
```

### FileService Operation Flow

```mermaid
graph TD
    subgraph "FileService Operations"
        Read[readFile]
        Write[writeFile]
        Create[createFile]
        Delete[deleteFile]
        Copy[copyFile]
        Move[moveFile]
    end

    subgraph "Validation Layer"
        PathVal[Path Validation]
        PermVal[Permission Check]
        ExistVal[Existence Check]
    end

    subgraph "Execution Layer"
        FSOp[FS Operation]
        Cache[Cache Update]
        Event[Event Emission]
    end

    subgraph "Error Handling"
        ErrorMap[Error Mapping]
        Recovery[Recovery Strategy]
        Logging[Error Logging]
    end

    Read --> PathVal
    Write --> PathVal
    Create --> PathVal
    Delete --> PathVal
    Copy --> PathVal
    Move --> PathVal
    
    PathVal --> PermVal
    PermVal --> ExistVal
    ExistVal --> FSOp
    
    FSOp --> Cache
    Cache --> Event
    
    FSOp --> ErrorMap
    ErrorMap --> Recovery
    Recovery --> Logging
```

### Repository Pattern Implementation

```mermaid
classDiagram
    class IProjectRepository {
        <<interface>>
        +create(project: Project): Promise~Project~
        +findById(id: string): Promise~Project|null~
        +findAll(): Promise~Project[]~
        +update(id: string, data: Partial~Project~): Promise~Project~
        +delete(id: string): Promise~void~
    }

    class InMemoryProjectRepository {
        -projects: Map~string, Project~
        +create(project: Project): Promise~Project~
        +findById(id: string): Promise~Project|null~
        +findAll(): Promise~Project[]~
        +update(id: string, data: Partial~Project~): Promise~Project~
        +delete(id: string): Promise~void~
    }

    class SQLiteProjectRepository {
        -db: Database
        +create(project: Project): Promise~Project~
        +findById(id: string): Promise~Project|null~
        +findAll(): Promise~Project[]~
        +update(id: string, data: Partial~Project~): Promise~Project~
        +delete(id: string): Promise~void~
    }

    class ProjectService {
        -repository: IProjectRepository
        -eventEmitter: IEventEmitter
        +createProject(dto: CreateProjectDto): Promise~Project~
        +getProject(id: string): Promise~Project~
        +listProjects(): Promise~Project[]~
        +updateProject(id: string, dto: UpdateProjectDto): Promise~Project~
        +deleteProject(id: string): Promise~void~
    }

    IProjectRepository <|.. InMemoryProjectRepository
    IProjectRepository <|.. SQLiteProjectRepository
    ProjectService --> IProjectRepository
```

### Event-Driven Architecture

```mermaid
graph LR
    subgraph "Event Emitters"
        ProjectEmitter[Project Events]
        FileEmitter[File Events]
        SessionEmitter[Session Events]
    end

    subgraph "Event Types"
        Created[created]
        Updated[updated]
        Deleted[deleted]
        Changed[changed]
    end

    subgraph "Event Listeners"
        UIListener[UI Updates]
        CacheListener[Cache Invalidation]
        LogListener[Audit Logging]
        SyncListener[Sync Service]
    end

    ProjectEmitter --> Created
    ProjectEmitter --> Updated
    ProjectEmitter --> Deleted
    
    FileEmitter --> Created
    FileEmitter --> Changed
    FileEmitter --> Deleted
    
    Created --> UIListener
    Updated --> UIListener
    Deleted --> UIListener
    Changed --> UIListener
    
    Created --> CacheListener
    Updated --> CacheListener
    Deleted --> CacheListener
    
    Created --> LogListener
    Updated --> LogListener
    Deleted --> LogListener
    
    Changed --> SyncListener
```

### Use Case Execution Flow

```mermaid
stateDiagram-v2
    [*] --> Validation
    Validation --> Authorization
    Authorization --> PreConditions
    PreConditions --> Execution
    Execution --> PostProcessing
    PostProcessing --> EventEmission
    EventEmission --> [*]
    
    Validation --> [*]: Validation Error
    Authorization --> [*]: Unauthorized
    PreConditions --> [*]: Precondition Failed
    Execution --> ErrorHandling: Execution Error
    ErrorHandling --> Rollback
    Rollback --> [*]
```

## Structure

```
core/
├── src/
│   ├── entities/        # Domain entities
│   │   ├── project.ts   # Project entity
│   │   └── session.ts   # Session entity (planned)
│   ├── use-cases/       # Business use cases
│   │   └── project/     # Project-related use cases
│   ├── interfaces/      # Port interfaces (repository patterns)
│   │   └── repositories.ts
│   ├── services/        # Business services
│   │   ├── project.service.ts  # Project management service
│   │   └── file.service.ts     # File operations service
│   └── index.ts         # Main exports
├── package.json
└── tsconfig.json
```

## Key Concepts

### Entities
Domain models that represent the core business concepts:
- **Project**: Represents a code project with metadata
- **Session**: AI conversation session (planned)
- **Message**: Chat messages (planned)

### Use Cases
Business operations that can be performed:
- Create, read, update, delete projects
- Validate project configurations
- Manage project lifecycle

### Interfaces (Ports)
Abstractions for external dependencies:
```typescript
interface IProjectRepository {
  create(project: Project): Promise<Project>
  findById(id: string): Promise<Project | null>
  findAll(): Promise<Project[]>
  update(id: string, data: Partial<Project>): Promise<Project>
  delete(id: string): Promise<void>
}
```

### Services
Business logic implementation:
- **ProjectService**: Handles all project-related operations
- **FileService**: Manages file system operations

## Usage

```typescript
import { ProjectService, Project } from '@code-pilot/core';

// Initialize service with repository
const projectService = new ProjectService(projectRepository, eventEmitter);

// Create a project
const project = await projectService.createProject({
  name: 'My Project',
  path: '/path/to/project',
  description: 'A new project'
});

// List all projects
const projects = await projectService.listProjects();
```

## Dependencies

- `@code-pilot/types` - Shared TypeScript types
- `uuid` - For generating unique IDs
- `@tauri-apps/api` - For file system operations

## Architecture Principles

1. **Dependency Inversion**: Services depend on interfaces, not implementations
2. **Single Responsibility**: Each class has one reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Small, focused interfaces
5. **Liskov Substitution**: Implementations are interchangeable

## Testing

The core package is designed to be highly testable:
- All dependencies are injected
- Business logic is isolated from infrastructure
- Mock implementations can be easily created

```typescript
// Example test setup
const mockRepository: IProjectRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  // ... other methods
};

const service = new ProjectService(mockRepository, mockEventEmitter);
```

## Future Enhancements

- Session management logic
- AI provider abstractions
- Plugin system core
- Advanced project templates
- Workspace management
- User preferences handling