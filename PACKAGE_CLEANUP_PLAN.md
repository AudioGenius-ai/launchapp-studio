# Package Cleanup Plan

## Immediate Actions Required

### 1. Components to Migrate from @code-pilot/ui to @code-pilot/ui-kit
- [x] Tabs, TabsList, TabsTrigger, TabsContent - DONE (copied to navigation/Tabs.tsx)
- [ ] TabGroup (from TabManager)
- [ ] FileTree (from FileExplorer) 
- [ ] CompactThemeSwitcher

### 2. Update Feature Package Dependencies

All feature packages need to update their imports:

#### @code-pilot/feature-ai
- `components/ClaudePage.tsx`: Change Button import from @code-pilot/ui to @code-pilot/ui-kit

#### @code-pilot/feature-editor  
- `components/TabManagerContainer.tsx`: Need to copy TabGroup locally or redesign
- Remove dependency on @code-pilot/ui

#### @code-pilot/feature-explorer
- `components/FileExplorer.tsx`: Need to copy FileTree locally or redesign
- Remove dependency on @code-pilot/ui

#### @code-pilot/feature-git
- `components/GitBranch.tsx`: Change Button import from @code-pilot/ui to @code-pilot/ui-kit

#### @code-pilot/feature-projects
- All components: Change cn import from @code-pilot/ui to @code-pilot/ui-kit
- `ProjectsPage.tsx`: Need to handle CompactThemeSwitcher
- `ProjectForm.tsx`: Change Button, Input, Label imports to @code-pilot/ui-kit

#### @code-pilot/feature-templates
- Update all component imports to use @code-pilot/ui-kit
- Components affected: ProjectCreationWizard, StartProjectDialog, TemplatePreview, TemplateCard

#### @code-pilot/feature-window-management
- All components: Change cn import from @code-pilot/ui to @code-pilot/ui-kit
- `WindowManager.tsx`: Change Button import to @code-pilot/ui-kit

### 3. Fix Package.json Issues

#### Standardize workspace protocol
Change all `workspace:^` to `workspace:*` in:
- @code-pilot/core
- @code-pilot/ui

#### Fix React versions
Update all packages to use `"react": "^19.0.0"` consistently

#### Fix export paths
- @code-pilot/state: Change main from "./src/index.ts" to "./dist/index.js"
- @code-pilot/feature-window-management: Fix exports to use dist files

### 4. Build Order

After making changes, build in this order:
1. @code-pilot/types
2. @code-pilot/utils  
3. @code-pilot/ui-kit
4. @code-pilot/core
5. All other packages

### 5. Remove Legacy Package
Once all migrations are complete:
- Delete packages/ui entirely
- Remove @code-pilot/ui from desktop app dependencies

## Commands to Run

```bash
# After each change, rebuild affected packages
pnpm --filter @code-pilot/ui-kit build
pnpm --filter @code-pilot/feature-* build

# Final cleanup
rm -rf packages/ui
pnpm install
pnpm build
```