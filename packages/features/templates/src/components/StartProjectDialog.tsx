import React, { useState, useMemo } from 'react';
import { Template, TemplateCategory } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@code-pilot/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@code-pilot/ui';
import { Input } from '@code-pilot/ui';
import { Button } from '@code-pilot/ui';
import { ScrollArea } from '@code-pilot/ui';
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
  { value: TemplateCategory.NextJS, label: 'Next.js', icon: '▲' },
  { value: TemplateCategory.Node, label: 'Node.js', icon: '🟢' },
  { value: TemplateCategory.Python, label: 'Python', icon: '🐍' },
  { value: TemplateCategory.Rust, label: 'Rust', icon: '🦀' },
  { value: TemplateCategory.Desktop, label: 'Desktop', icon: '💻' },
  { value: TemplateCategory.Mobile, label: 'Mobile', icon: '📱' },
  { value: TemplateCategory.CLI, label: 'CLI', icon: '🖥️' },
  { value: TemplateCategory.Monorepo, label: 'Monorepo', icon: '📦' },
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
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-2xl">Start New Project</DialogTitle>
              <DialogDescription>
                Choose a template to kickstart your project or open an existing folder
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
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

              <TabsContent value="templates" className="flex-1 flex flex-col mt-0">
                <div className="px-6 py-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="flex items-center gap-1"
                      >
                        {category.icon && <span>{category.icon}</span>}
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Template Grid */}
                <ScrollArea className="flex-1 px-6 pb-6">
                  <TemplateGrid
                    templates={filteredTemplates}
                    onTemplateSelect={handleTemplateSelect}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                  />
                </ScrollArea>
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