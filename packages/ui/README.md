# UI Package

Shared React component library for Code Pilot Studio v2.

## Overview

This package contains all reusable UI components built with React, TypeScript, Radix UI primitives, and Tailwind CSS. Components are designed to be accessible, themeable, and composable.

## Component Architecture

```mermaid
graph TB
    subgraph "Component Categories"
        Base[Base Components]
        Feature[Feature Components]
        Layout[Layout Components]
    end
    
    subgraph "Base Components"
        Button[Button]
        Dialog[Dialog]
        Tabs[Tabs]
        Input[Input]
        Select[Select]
    end
    
    subgraph "Feature Components"
        ProjectCard[ProjectCard]
        ProjectList[ProjectList]
        CreateProjectDialog[CreateProjectDialog]
        FileTree[FileTree]
        FileExplorer[FileExplorer]
        EditorContainer[EditorContainer]
    end
    
    subgraph "Dependencies"
        Radix[Radix UI]
        CVA[class-variance-authority]
        Lucide[Lucide Icons]
        Monaco[Monaco Editor]
        TW[Tailwind CSS]
    end
    
    subgraph "Consumers"
        Desktop[Desktop App]
        Web[Web App]
        Plugins[Plugins]
    end
    
    Base --> Feature
    Feature --> Layout
    
    Button --> Radix
    Button --> CVA
    Dialog --> Radix
    FileTree --> Lucide
    EditorContainer --> Monaco
    Base --> TW
    Feature --> TW
    
    Desktop --> Base
    Desktop --> Feature
    Web --> Base
    Web --> Feature
    Plugins --> Base
    
    style Base fill:#E3F2FD
    style Feature fill:#C8E6C9
    style Radix fill:#FFE0B2
```

## Component Lifecycle Flows

This diagram shows how components mount, update, and unmount in the UI system:

```mermaid
graph TB
    subgraph "Component Lifecycle"
        Init[Component Initialized]
        Mount[Component Mount]
        Update[Component Update]
        Unmount[Component Unmount]
    end
    
    subgraph "Mount Phase"
        Constructor[Constructor/Setup]
        GetInitialProps[Get Initial Props]
        SetupState[Setup Initial State]
        RegisterEffects[Register Effects]
        RenderFirst[First Render]
        RunEffects[Run Layout Effects]
        RunAsyncEffects[Run Async Effects]
    end
    
    subgraph "Update Phase"
        PropsChange[Props Change]
        StateChange[State Change]
        ContextChange[Context Change]
        ShouldUpdate{Should Update?}
        PrepareUpdate[Prepare Update]
        RenderUpdate[Re-render]
        CommitUpdate[Commit to DOM]
        UpdateEffects[Update Effects]
    end
    
    subgraph "Unmount Phase"
        CleanupStart[Start Cleanup]
        CleanupEffects[Cleanup Effects]
        CleanupState[Cleanup State]
        CleanupRefs[Cleanup Refs]
        RemoveDOM[Remove from DOM]
        CleanupComplete[Cleanup Complete]
    end
    
    Init --> Mount
    Mount --> Constructor
    Constructor --> GetInitialProps
    GetInitialProps --> SetupState
    SetupState --> RegisterEffects
    RegisterEffects --> RenderFirst
    RenderFirst --> RunEffects
    RunEffects --> RunAsyncEffects
    
    RunAsyncEffects --> Update
    Update --> PropsChange
    Update --> StateChange
    Update --> ContextChange
    
    PropsChange --> ShouldUpdate
    StateChange --> ShouldUpdate
    ContextChange --> ShouldUpdate
    
    ShouldUpdate -->|Yes| PrepareUpdate
    ShouldUpdate -->|No| Update
    
    PrepareUpdate --> RenderUpdate
    RenderUpdate --> CommitUpdate
    CommitUpdate --> UpdateEffects
    UpdateEffects --> Update
    
    Update --> Unmount
    Unmount --> CleanupStart
    CleanupStart --> CleanupEffects
    CleanupEffects --> CleanupState
    CleanupState --> CleanupRefs
    CleanupRefs --> RemoveDOM
    RemoveDOM --> CleanupComplete
    
    style Init fill:#E3F2FD
    style Mount fill:#C8E6C9
    style Update fill:#FFF9C4
    style Unmount fill:#FFCDD2
```

## State Management Flows

This diagram illustrates how state flows through components using various state management patterns:

```mermaid
graph TB
    subgraph "State Sources"
        LocalState[Local Component State]
        PropsState[Props from Parent]
        ContextState[Context State]
        GlobalStore[Global Store]
    end
    
    subgraph "State Management"
        useState[useState Hook]
        useReducer[useReducer Hook]
        useContext[useContext Hook]
        customHooks[Custom Hooks]
    end
    
    subgraph "State Flow"
        Component[Component]
        StateUpdate[State Update]
        Reconciliation[React Reconciliation]
        VirtualDOM[Virtual DOM]
        ActualDOM[Actual DOM]
    end
    
    subgraph "Update Triggers"
        UserAction[User Action]
        APIResponse[API Response]
        Timer[Timer/Interval]
        RouteChange[Route Change]
    end
    
    subgraph "Performance"
        Memoization[React.memo]
        UseMemo[useMemo]
        UseCallback[useCallback]
        LazyState[Lazy State Init]
    end
    
    LocalState --> useState
    LocalState --> useReducer
    PropsState --> Component
    ContextState --> useContext
    GlobalStore --> customHooks
    
    useState --> Component
    useReducer --> Component
    useContext --> Component
    customHooks --> Component
    
    UserAction --> StateUpdate
    APIResponse --> StateUpdate
    Timer --> StateUpdate
    RouteChange --> StateUpdate
    
    StateUpdate --> Component
    Component --> Reconciliation
    Reconciliation --> VirtualDOM
    VirtualDOM --> ActualDOM
    
    Component --> Memoization
    Component --> UseMemo
    Component --> UseCallback
    useState --> LazyState
    
    Memoization -.->|Optimize| Reconciliation
    UseMemo -.->|Cache| Component
    UseCallback -.->|Stable Refs| Component
    LazyState -.->|Performance| useState
    
    style LocalState fill:#E1F5FE
    style PropsState fill:#E8F5E9
    style ContextState fill:#FFF3E0
    style GlobalStore fill:#F3E5F5
    style StateUpdate fill:#FFCDD2
    style Component fill:#C8E6C9
```

## Event Handling Flows

This diagram shows how user interactions and events propagate through the component system:

```mermaid
graph TB
    subgraph "Event Sources"
        UserClick[User Click]
        KeyboardInput[Keyboard Input]
        MouseMove[Mouse Movement]
        TouchGesture[Touch Gesture]
        FormSubmit[Form Submit]
        DragDrop[Drag & Drop]
    end
    
    subgraph "Event Capture Phase"
        WindowCapture[Window]
        DocumentCapture[Document]
        ParentCapture[Parent Component]
        TargetCapture[Target Component]
    end
    
    subgraph "Event Handling"
        EventListener[Event Listener]
        EventHandler[Event Handler]
        EventPrevention[preventDefault]
        EventStop[stopPropagation]
        SyntheticEvent[Synthetic Event]
    end
    
    subgraph "Event Bubbling Phase"
        TargetBubble[Target Component]
        ParentBubble[Parent Component]
        DocumentBubble[Document]
        WindowBubble[Window]
    end
    
    subgraph "State Updates"
        LocalUpdate[Update Local State]
        ParentUpdate[Notify Parent]
        ContextUpdate[Update Context]
        GlobalUpdate[Update Global Store]
    end
    
    subgraph "Side Effects"
        APICall[API Call]
        Analytics[Analytics Event]
        Navigation[Navigation]
        Validation[Form Validation]
    end
    
    UserClick --> WindowCapture
    KeyboardInput --> WindowCapture
    MouseMove --> WindowCapture
    TouchGesture --> WindowCapture
    FormSubmit --> WindowCapture
    DragDrop --> WindowCapture
    
    WindowCapture --> DocumentCapture
    DocumentCapture --> ParentCapture
    ParentCapture --> TargetCapture
    
    TargetCapture --> EventListener
    EventListener --> SyntheticEvent
    SyntheticEvent --> EventHandler
    
    EventHandler --> EventPrevention
    EventHandler --> EventStop
    EventHandler --> LocalUpdate
    
    EventHandler --> TargetBubble
    TargetBubble --> ParentBubble
    ParentBubble --> DocumentBubble
    DocumentBubble --> WindowBubble
    
    LocalUpdate --> ParentUpdate
    LocalUpdate --> ContextUpdate
    LocalUpdate --> GlobalUpdate
    
    EventHandler --> APICall
    EventHandler --> Analytics
    EventHandler --> Navigation
    EventHandler --> Validation
    
    style UserClick fill:#FFEBEE
    style EventHandler fill:#C8E6C9
    style LocalUpdate fill:#E3F2FD
    style APICall fill:#FFF9C4
```

## Theme System Flow

This diagram illustrates how theming works across components in the UI system:

```mermaid
graph TB
    subgraph "Theme Sources"
        SystemTheme[System Preference]
        UserTheme[User Preference]
        DefaultTheme[Default Theme]
    end
    
    subgraph "Theme Provider"
        ThemeContext[Theme Context]
        ThemeState[Theme State]
        ThemeToggle[Theme Toggle]
        ThemePersist[Theme Persistence]
    end
    
    subgraph "CSS Variables"
        RootVars[:root CSS Variables]
        DarkVars[.dark CSS Variables]
        ColorVars[Color Variables]
        SpacingVars[Spacing Variables]
        FontVars[Font Variables]
    end
    
    subgraph "Component Theming"
        BaseStyles[Base Component Styles]
        VariantStyles[Variant Styles]
        DarkModeStyles[Dark Mode Styles]
        CustomStyles[Custom Overrides]
    end
    
    subgraph "Tailwind Integration"
        TailwindConfig[Tailwind Config]
        UtilityClasses[Utility Classes]
        DarkPrefix[dark: Prefix]
        CustomColors[Custom Colors]
    end
    
    subgraph "Component Usage"
        ButtonTheme[Button Theme]
        DialogTheme[Dialog Theme]
        InputTheme[Input Theme]
        CardTheme[Card Theme]
    end
    
    SystemTheme --> ThemeContext
    UserTheme --> ThemeContext
    DefaultTheme --> ThemeContext
    
    ThemeContext --> ThemeState
    ThemeState --> ThemeToggle
    ThemeState --> ThemePersist
    
    ThemeState --> RootVars
    ThemeState --> DarkVars
    RootVars --> ColorVars
    RootVars --> SpacingVars
    RootVars --> FontVars
    
    ColorVars --> BaseStyles
    SpacingVars --> BaseStyles
    FontVars --> BaseStyles
    
    BaseStyles --> VariantStyles
    DarkVars --> DarkModeStyles
    VariantStyles --> CustomStyles
    DarkModeStyles --> CustomStyles
    
    TailwindConfig --> UtilityClasses
    TailwindConfig --> DarkPrefix
    TailwindConfig --> CustomColors
    
    CustomColors --> ColorVars
    UtilityClasses --> BaseStyles
    DarkPrefix --> DarkModeStyles
    
    CustomStyles --> ButtonTheme
    CustomStyles --> DialogTheme
    CustomStyles --> InputTheme
    CustomStyles --> CardTheme
    
    ThemePersist -.->|localStorage| UserTheme
    
    style ThemeContext fill:#E8EAF6
    style RootVars fill:#E1F5FE
    style BaseStyles fill:#C8E6C9
    style ButtonTheme fill:#FFF9C4
```

## Component Composition Patterns

This diagram shows how compound components work together to create complex UI patterns:

```mermaid
graph TB
    subgraph "Compound Components"
        DialogRoot[Dialog Root]
        DialogTrigger[Dialog Trigger]
        DialogContent[Dialog Content]
        DialogHeader[Dialog Header]
        DialogFooter[Dialog Footer]
    end
    
    subgraph "Context Sharing"
        DialogContext[Dialog Context]
        OpenState[Open State]
        CloseMethod[Close Method]
        SharedProps[Shared Props]
    end
    
    subgraph "Tabs Pattern"
        TabsRoot[Tabs Root]
        TabsList[Tabs List]
        TabsTrigger[Tabs Trigger]
        TabsContent[Tabs Content]
        ActiveTab[Active Tab State]
    end
    
    subgraph "Form Pattern"
        FormRoot[Form Root]
        FormField[Form Field]
        FormLabel[Form Label]
        FormInput[Form Input]
        FormError[Form Error]
        FormState[Form State]
    end
    
    subgraph "Layout Pattern"
        LayoutRoot[Layout Root]
        Header[Header]
        Sidebar[Sidebar]
        Content[Content Area]
        Footer[Footer]
        LayoutContext[Layout Context]
    end
    
    subgraph "Provider Pattern"
        AppProvider[App Provider]
        ThemeProvider[Theme Provider]
        AuthProvider[Auth Provider]
        DataProvider[Data Provider]
    end
    
    DialogRoot --> DialogContext
    DialogContext --> OpenState
    DialogContext --> CloseMethod
    DialogContext --> SharedProps
    
    DialogTrigger --> DialogContext
    DialogContent --> DialogContext
    DialogHeader --> DialogContext
    DialogFooter --> DialogContext
    
    TabsRoot --> ActiveTab
    TabsList --> ActiveTab
    TabsTrigger --> ActiveTab
    TabsContent --> ActiveTab
    
    FormRoot --> FormState
    FormField --> FormState
    FormLabel --> FormField
    FormInput --> FormField
    FormError --> FormField
    
    LayoutRoot --> LayoutContext
    Header --> LayoutContext
    Sidebar --> LayoutContext
    Content --> LayoutContext
    Footer --> LayoutContext
    
    AppProvider --> ThemeProvider
    ThemeProvider --> AuthProvider
    AuthProvider --> DataProvider
    DataProvider --> LayoutRoot
    
    LayoutRoot --> DialogRoot
    LayoutRoot --> TabsRoot
    LayoutRoot --> FormRoot
    
    style DialogRoot fill:#E8EAF6
    style TabsRoot fill:#E8F5E9
    style FormRoot fill:#FFF3E0
    style LayoutRoot fill:#FCE4EC
    style AppProvider fill:#E1F5FE
```

## Structure

```
ui/
├── src/
│   ├── components/          # UI components
│   │   ├── Button/         # Button component
│   │   ├── Dialog/         # Dialog component
│   │   ├── Tabs/           # Tabs component
│   │   ├── Project/        # Project-related components
│   │   ├── FileExplorer/   # File tree and explorer
│   │   └── Editor/         # Monaco editor wrapper
│   ├── theme/              # Theme configuration
│   ├── lib/                # Utilities
│   │   └── utils.ts        # Helper functions
│   └── index.ts            # Main exports
├── package.json
└── tsconfig.json
```

## Components

### Base Components

#### Button
A versatile button component with multiple variants:
```tsx
import { Button } from '@code-pilot/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

#### Dialog
Modal dialog using Radix UI:
```tsx
import { Dialog } from '@code-pilot/ui';

<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Dialog Title"
  description="Dialog description"
>
  <DialogContent />
</Dialog>
```

#### Tabs
Tab navigation component:
```tsx
import { Tabs } from '@code-pilot/ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Feature Components

#### CreateProjectDialog
Complete project creation flow:
```tsx
import { CreateProjectDialog } from '@code-pilot/ui';

<CreateProjectDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onProjectCreate={handleProjectCreate}
/>
```

#### ProjectCard & ProjectList
Project display components:
```tsx
import { ProjectList } from '@code-pilot/ui';

<ProjectList
  projects={projects}
  onProjectSelect={handleSelect}
  onProjectDelete={handleDelete}
/>
```

#### FileTree & FileExplorer
File system navigation:
```tsx
import { FileTree } from '@code-pilot/ui';

<FileTree
  rootPath="/path/to/project"
  onFileSelect={handleFileSelect}
  onFileOpen={handleFileOpen}
/>
```

#### EditorContainer
Monaco editor integration:
```tsx
import { EditorContainer } from '@code-pilot/ui';

<EditorContainer
  ref={editorRef}
  fileService={fileService}
  onFileChange={handleFileChange}
/>
```

## Styling

### Tailwind CSS
All components use Tailwind CSS v4 for styling:
- Utility-first approach
- Dark mode support
- Responsive design
- Custom color palette

### Theme System
Components support theming through CSS variables:
```css
:root {
  --primary: 220 13% 69%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

### Class Variance Authority
Used for component variants:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
  }
);
```

## Dependencies

### Radix UI Primitives
- `@radix-ui/react-dialog` - Accessible dialog
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-tabs` - Tab navigation

### Icons
- `lucide-react` - Modern icon library

### Editor
- `@monaco-editor/react` - Monaco editor wrapper
- `monaco-editor` - Core editor

### Utilities
- `class-variance-authority` - Variant management
- `clsx` - Class name utilities
- `tailwind-merge` - Merge Tailwind classes

## Usage

### Installation
Components are available through the workspace:
```json
{
  "dependencies": {
    "@code-pilot/ui": "workspace:*"
  }
}
```

### Import Components
```typescript
import { 
  Button, 
  Dialog, 
  ProjectList,
  FileTree,
  EditorContainer 
} from '@code-pilot/ui';
```

## Development

### Component Guidelines
1. Use TypeScript for all components
2. Include proper prop types
3. Support controlled and uncontrolled modes
4. Ensure accessibility (ARIA labels, keyboard navigation)
5. Support dark mode
6. Write component documentation

### Testing
- Unit tests with Vitest
- Component testing planned
- Accessibility testing

### Storybook
Component development and documentation:
```bash
pnpm storybook
```

## Future Enhancements

- Terminal component
- Settings panels
- Command palette
- Status bar
- Split pane layouts
- Context menus
- Toast notifications
- Loading states
- Error boundaries