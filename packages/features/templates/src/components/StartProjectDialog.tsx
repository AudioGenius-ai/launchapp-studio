import React, { useState, useMemo } from 'react';
import { Template, TemplateCategory } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@code-pilot/ui-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@code-pilot/ui-kit';
import { Input } from '@code-pilot/ui-kit';
import { Button } from '@code-pilot/ui-kit';
import { ScrollArea } from '@code-pilot/ui-kit';
import { TemplateGrid } from './TemplateGrid';
import { TemplatePreview } from './TemplatePreview';
import { ProjectCreationWizard } from './ProjectCreationWizard';
import { Search, Sparkles, FolderOpen, GitBranch } from 'lucide-react';
import { cn } from '@code-pilot/utils';

interface StartProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onCreateProject: (template: Template, options: any) => Promise<void>;
  onOpenFolder?: () => void;
  onCloneRepo?: () => void;
}

const categories: { value: TemplateCategory | 'all'; label: string; icon?: string }[] = [
  { value: 'all', label: 'All Templates' },
  { value: TemplateCategory.React, label: 'React', icon: '⚛️' },
  { value: TemplateCategory.Vue, label: 'Vue', icon: '💚' },
  { value: TemplateCategory.Angular, label: 'Angular', icon: '🅰️' },
  { value: TemplateCategory.FullStack, label: 'Full Stack', icon: '🌐' },
  { value: TemplateCategory.Backend, label: 'Backend', icon: '⚙️' },
  { value: TemplateCategory.Desktop, label: 'Desktop', icon: '💻' },
  { value: TemplateCategory.Mobile, label: 'Mobile', icon: '📱' },
  { value: TemplateCategory.Library, label: 'Library', icon: '📚' },
  { value: TemplateCategory.Tooling, label: 'Tooling', icon: '🔧' },
];

export function StartProjectDialog({
  open,
  onOpenChange,
  templates,
  onCreateProject,
  onOpenFolder,
  onCloneRepo,
}: StartProjectDialogProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreationWizard, setShowCreationWizard] = useState(false);

  // Filter templates by search and category
  const filteredTemplates = useMemo(() => {
    return templates;
  }, [templates]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      setShowPreview(false);
      setShowCreationWizard(true);
    }
  };

  const handleCreateProject = async (options: any) => {
    if (selectedTemplate) {
      await onCreateProject(selectedTemplate, options);
      setShowCreationWizard(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background">
              <DialogTitle className="text-2xl font-bold">Start New Project</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Choose a template to kickstart your project or open an existing folder
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-6 pt-4 pb-2 shrink-0">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="folder" className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Open Folder
                  </TabsTrigger>
                  <TabsTrigger value="clone" className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Clone Repo
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="templates" className="flex-1 flex flex-col mt-0 overflow-hidden">
                <div className="px-6 py-4 space-y-3 bg-muted/20 border-b">
                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-muted-foreground/20"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {categories.slice(0, 8).map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="h-8 px-3 text-xs"
                      >
                        {category.icon && <span className="text-sm mr-1">{category.icon}</span>}
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Template Grid */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-6">
                    <TemplateGrid
                      templates={filteredTemplates}
                      onTemplateSelect={handleTemplateSelect}
                      selectedCategory={selectedCategory}
                      searchQuery={searchQuery}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="folder" className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Open Existing Project</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Browse your file system to open an existing project folder
                  </p>
                  <Button onClick={onOpenFolder}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Browse Folders
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="clone" className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <GitBranch className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Clone Repository</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Clone a Git repository from GitHub, GitLab, or any Git URL
                  </p>
                  <Button onClick={onCloneRepo}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Clone Repository
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          open={showPreview}
          onOpenChange={setShowPreview}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {/* Project Creation Wizard */}
      {selectedTemplate && (
        <ProjectCreationWizard
          template={selectedTemplate}
          open={showCreationWizard}
          onOpenChange={setShowCreationWizard}
          onCreateProject={handleCreateProject}
        />
      )}
    </>
  );
}