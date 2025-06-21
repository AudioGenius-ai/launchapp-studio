# Utils Package

Shared utility functions and helpers for Code Pilot Studio v2.

## Overview

This package contains common utility functions, helpers, and constants used across the monorepo. It provides reusable functionality to avoid code duplication.

```mermaid
graph TD
    subgraph "Utils Package Structure"
        A[Utils Package] --> B[String Utilities]
        A --> C[Date Utilities]
        A --> D[File Utilities]
        A --> E[Validation Utilities]
        A --> F[Async Utilities]
        A --> G[Platform Utilities]
        A --> H[Formatting Utilities]
        
        B --> B1[truncate]
        B --> B2[toKebabCase]
        B --> B3[toPascalCase]
        B --> B4[sanitizeFileName]
        
        C --> C1[formatRelativeTime]
        C --> C2[toISOString]
        C --> C3[parseDate]
        
        D --> D1[getFileName]
        D --> D2[joinPath]
        D --> D3[normalizePath]
        
        E --> E1[isValidProjectName]
        E --> E2[isValidFilePath]
        E --> E3[validate]
        
        F --> F1[debounce]
        F --> F2[throttle]
        F --> F3[retry]
        
        G --> G1[getPlatform]
        G --> G2[isDevelopment]
        G --> G3[getPlatformPaths]
        
        H --> H1[formatCode]
        H --> H2[formatBytes]
        H --> H3[pluralize]
    end
    
    style A fill:#4A90E2,stroke:#2E5C8A,color:#fff
    style B fill:#7ED321,stroke:#5A9D18,color:#fff
    style C fill:#F5A623,stroke:#C77F1A,color:#fff
    style D fill:#BD10E0,stroke:#8A0CAE,color:#fff
    style E fill:#50E3C2,stroke:#2FA896,color:#fff
    style F fill:#B8E986,stroke:#8AB362,color:#fff
    style G fill:#FF6B6B,stroke:#CC5555,color:#fff
    style H fill:#4FC3F7,stroke:#29B6F6,color:#fff
```

## Structure

```
utils/
├── src/
│   ├── string.ts        # String manipulation utilities
│   ├── date.ts          # Date formatting and manipulation
│   ├── file.ts          # File path and extension utilities
│   ├── validation.ts    # Input validation functions
│   ├── formatting.ts    # Code and text formatting
│   ├── async.ts         # Async utilities
│   ├── platform.ts      # Platform-specific helpers
│   └── index.ts         # Main exports
├── package.json
└── tsconfig.json
```

## Utility Categories

### String Utilities
```typescript
// Truncate string with ellipsis
export function truncate(str: string, maxLength: number): string

// Convert to kebab-case
export function toKebabCase(str: string): string

// Convert to PascalCase
export function toPascalCase(str: string): string

// Sanitize file names
export function sanitizeFileName(name: string): string

// Extract file extension
export function getFileExtension(path: string): string
```

### Date Utilities
```typescript
// Format date to relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string

// Format date to ISO string
export function toISOString(date: Date): string

// Parse various date formats
export function parseDate(dateString: string): Date

// Get time difference
export function getTimeDiff(start: Date, end: Date): Duration
```

### File Utilities
```typescript
// Get file name from path
export function getFileName(path: string): string

// Get directory from path
export function getDirectory(path: string): string

// Join paths safely
export function joinPath(...paths: string[]): string

// Check if path is absolute
export function isAbsolutePath(path: string): boolean

// Normalize path separators
export function normalizePath(path: string): string

// Get file size formatted
export function formatFileSize(bytes: number): string
```

### Validation Utilities
```typescript
// Validate project name
export function isValidProjectName(name: string): boolean

// Validate file path
export function isValidFilePath(path: string): boolean

// Validate URL
export function isValidUrl(url: string): boolean

// Validate email
export function isValidEmail(email: string): boolean

// Custom validation rules
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export function validate(value: any, rules: ValidationRule[]): ValidationResult
```

### Async Utilities
```typescript
// Debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void

// Throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void

// Retry failed operations
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>

// Create cancellable promise
export function cancellable<T>(
  promise: Promise<T>
): [Promise<T>, () => void]

// Sleep/delay
export function sleep(ms: number): Promise<void>
```

### Platform Utilities
```typescript
// Get current platform
export function getPlatform(): 'windows' | 'macos' | 'linux'

// Check if running in development
export function isDevelopment(): boolean

// Get platform-specific paths
export function getPlatformPaths(): PlatformPaths

// Platform-specific keyboard shortcuts
export function getPlatformShortcut(action: string): string
```

### Formatting Utilities
```typescript
// Format code with proper indentation
export function formatCode(code: string, language: string): string

// Convert bytes to human readable
export function formatBytes(bytes: number, decimals?: number): string

// Format numbers with separators
export function formatNumber(num: number): string

// Pluralize words
export function pluralize(count: number, singular: string, plural?: string): string
```

## Constants

```typescript
// File size units
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

// Common file extensions by category
export const CODE_EXTENSIONS = ['.ts', '.js', '.py', '.rs', '.go'];
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.gif', '.svg'];
export const DOCUMENT_EXTENSIONS = ['.md', '.pdf', '.doc', '.txt'];

// Platform constants
export const IS_WINDOWS = process.platform === 'win32';
export const IS_MAC = process.platform === 'darwin';
export const IS_LINUX = process.platform === 'linux';
```

## Usage Examples

```typescript
import { 
  formatRelativeTime, 
  sanitizeFileName, 
  debounce,
  formatFileSize 
} from '@code-pilot/utils';

// Format dates
const timeAgo = formatRelativeTime(new Date('2024-01-01'));
// => "2 months ago"

// Sanitize file names
const safeName = sanitizeFileName('my<file>name?.txt');
// => "my-file-name.txt"

// Debounce search input
const debouncedSearch = debounce((query: string) => {
  searchFiles(query);
}, 300);

// Format file sizes
const size = formatFileSize(1536);
// => "1.5 KB"
```

## Best Practices

1. **Pure Functions**: Keep utilities pure without side effects
2. **Type Safety**: Use TypeScript generics where appropriate
3. **Error Handling**: Return meaningful errors or null/undefined
4. **Performance**: Optimize for common use cases
5. **Testing**: Write unit tests for all utilities
6. **Documentation**: Include JSDoc comments with examples

## Utility Function Dependencies

This diagram shows which utilities depend on others within the utils package.

```mermaid
graph TD
    subgraph "Core Utilities"
        isValidPath[isValidPath]
        normalizePath[normalizePath]
        getPlatform[getPlatform]
    end
    
    subgraph "String Utilities"
        sanitizeFileName[sanitizeFileName]
        toKebabCase[toKebabCase]
        toPascalCase[toPascalCase]
        truncate[truncate]
    end
    
    subgraph "File Utilities"
        joinPath[joinPath]
        getFileName[getFileName]
        getDirectory[getDirectory]
        formatFileSize[formatFileSize]
    end
    
    subgraph "Validation Utilities"
        isValidProjectName[isValidProjectName]
        isValidFilePath[isValidFilePath]
        validate[validate]
    end
    
    subgraph "Async Utilities"
        debounce[debounce]
        throttle[throttle]
        retry[retry]
        cancellable[cancellable]
    end
    
    normalizePath --> isValidPath
    joinPath --> normalizePath
    getFileName --> normalizePath
    getDirectory --> normalizePath
    
    sanitizeFileName --> toKebabCase
    isValidProjectName --> sanitizeFileName
    isValidFilePath --> normalizePath
    isValidFilePath --> isValidPath
    
    validate --> isValidPath
    validate --> isValidProjectName
    
    retry --> sleep
    cancellable --> AbortController
    
    style isValidPath fill:#f9f,stroke:#333,stroke-width:4px
    style normalizePath fill:#f9f,stroke:#333,stroke-width:4px
    style getPlatform fill:#f9f,stroke:#333,stroke-width:4px
```

## Data Transformation Flow

This diagram illustrates how utilities process and transform data throughout the application.

```mermaid
sequenceDiagram
    participant Input as Raw Input
    participant Validator as Validation Utils
    participant Sanitizer as Sanitization Utils
    participant Formatter as Formatting Utils
    participant Output as Processed Output
    
    Input->>Validator: Raw Data
    
    alt Valid Input
        Validator->>Sanitizer: Valid Data
        Note over Sanitizer: Remove unsafe chars<br/>Normalize paths<br/>Trim whitespace
        Sanitizer->>Formatter: Clean Data
        Note over Formatter: Format dates<br/>Format file sizes<br/>Apply templates
        Formatter->>Output: Formatted Data
    else Invalid Input
        Validator-->>Input: Validation Error<br/>with Details
    end
    
    Note over Input,Output: Pipeline ensures data consistency<br/>and safety throughout the app
```

## Error Handling Flow

This diagram shows how errors are handled within utility functions.

```mermaid
graph TD
    subgraph "Utility Function"
        Start[Function Called]
        Validate[Validate Input]
        Process[Process Data]
        HandleError[Handle Error]
        Return[Return Result]
    end
    
    subgraph "Error Types"
        ValidationError[ValidationError<br/>- Invalid input<br/>- Type mismatch]
        ProcessingError[ProcessingError<br/>- Calculation error<br/>- Format error]
        SystemError[SystemError<br/>- File not found<br/>- Permission denied]
    end
    
    subgraph "Error Strategies"
        ReturnNull[Return null/undefined]
        ThrowError[Throw Error]
        ReturnDefault[Return Default Value]
        ReturnResult[Return Error Result]
    end
    
    Start --> Validate
    Validate -->|Valid| Process
    Validate -->|Invalid| ValidationError
    Process -->|Success| Return
    Process -->|Error| ProcessingError
    Process -->|System Issue| SystemError
    
    ValidationError --> HandleError
    ProcessingError --> HandleError
    SystemError --> HandleError
    
    HandleError --> ReturnNull
    HandleError --> ThrowError
    HandleError --> ReturnDefault
    HandleError --> ReturnResult
    
    style ValidationError fill:#ff9800
    style ProcessingError fill:#f44336
    style SystemError fill:#e91e63
```

## Performance Optimization Flow

This diagram illustrates how debounce and throttle utilities optimize performance.

```mermaid
sequenceDiagram
    participant User as User Input
    participant Debounce as Debounce Wrapper
    participant Throttle as Throttle Wrapper
    participant Function as Target Function
    participant Timer as Timer/Scheduler
    
    Note over User,Function: Debounce Example (Search)
    User->>Debounce: Type "H"
    Debounce->>Timer: Start 300ms timer
    User->>Debounce: Type "He"
    Debounce->>Timer: Cancel & restart timer
    User->>Debounce: Type "Hel"
    Debounce->>Timer: Cancel & restart timer
    User->>Debounce: Type "Hell"
    Debounce->>Timer: Cancel & restart timer
    User->>Debounce: Type "Hello"
    Debounce->>Timer: Cancel & restart timer
    Timer-->>Function: Execute after 300ms<br/>search("Hello")
    
    Note over User,Function: Throttle Example (Scroll)
    User->>Throttle: Scroll event 1
    Throttle->>Function: Execute immediately
    Throttle->>Timer: Block for 100ms
    User->>Throttle: Scroll event 2
    Throttle--xUser: Blocked (in cooldown)
    User->>Throttle: Scroll event 3
    Throttle--xUser: Blocked (in cooldown)
    Timer-->>Throttle: Cooldown complete
    User->>Throttle: Scroll event 4
    Throttle->>Function: Execute
    
    Note over Debounce,Throttle: Debounce: Delays execution until activity stops<br/>Throttle: Limits execution frequency
```

## Testing

All utilities should have comprehensive unit tests:

```typescript
import { describe, test, expect } from 'vitest';
import { formatFileSize } from './file';

describe('formatFileSize', () => {
  test('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});
```

## Future Additions

- Encryption utilities
- Color manipulation
- Performance monitoring
- Logger utilities
- Event emitter
- Object utilities (deep clone, merge)
- Array utilities
- Regular expression helpers
- UUID generation
- Hash functions