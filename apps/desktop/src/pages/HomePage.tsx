import React, { useEffect, useState } from 'react';
import { 
  MinimalLayout, 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@code-pilot/ui-kit';
import { Project, ProjectListResponse } from '@code-pilot/types';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import {
  FolderOpen,
  Plus,
  Settings,
  Clock,
  FileText,
  Search,
  Star,
  ExternalLink,
  Command,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  GitBranch,
  Zap,
  Shield,
  Palette,
  Github,
  Twitter,
  MessageSquare,
  Book,
  GraduationCap,
  Users,
  Globe,
  TrendingUp,
  ChevronRight,
  Rocket,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StartProjectDialog } from '@code-pilot/feature-templates';
import { useTemplates, useTemplateCreation } from '@code-pilot/feature-templates';

export const HomePage: React.FC = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentFiles, setRecentFiles] = useState<{ path: string; name: string; modified: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const navigate = useNavigate();
  const { templates, loadTemplates } = useTemplates();
  const { create: createProjectFromTemplate } = useTemplateCreation();

  useEffect(() => {
    loadRecentData();
    loadTemplates(); // Load templates when component mounts
  }, [loadTemplates]);

  const loadRecentData = async () => {
    try {
      setLoading(true);
      
      // Load recent projects
      const projectsResponse = (await invoke<ProjectListResponse>('list_projects'))

      // Sort by updatedAt and take the first 5
      const sortedProjects = projectsResponse.projects ?? []
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
      setRecentProjects(sortedProjects);

      // TODO: Implement recent files tracking in fileService
      // For now, we'll use mock data
      setRecentFiles([
        { path: '/project/src/App.tsx', name: 'App.tsx', modified: new Date() },
        { path: '/project/src/components/Header.tsx', name: 'Header.tsx', modified: new Date(Date.now() - 3600000) },
        { path: '/project/README.md', name: 'README.md', modified: new Date(Date.now() - 7200000) },
      ]);
    } catch (error) {
      console.error('Failed to load recent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async (project: Project) => {
    try {
      // Use direct Tauri command for now
      await invoke('create_project_window', {
        projectId: project.id,
        projectPath: project.path
      });
    } catch (error) {
      console.error('Failed to open project window:', error);
    }
  };

  const handleNewProject = () => {
    setShowTemplateDialog(true);
  };

  const handleCreateProject = async (template: any, options: any) => {
    try {
      await createProjectFromTemplate(options);
      // Refresh recent projects after creation
      await loadRecentData();
      // Close the dialog
      setShowTemplateDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleOpenProjectDialog = async () => {
    try {
      // Open directory picker dialog
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder'
      });

      if (selected && typeof selected === 'string') {
        // Get or create the project for this path
        const project = await invoke<Project>('get_or_create_project_by_path', {
          path: selected,
          name: null // Let it auto-detect from path
        });
        
        // Now open the project window with the actual project ID
        await invoke('create_project_window', {
          projectId: project.id,
          projectPath: project.path
        });
        
        // Refresh the recent projects list
        await loadRecentData();
      }
    } catch (error) {
      console.error('Failed to open project:', error);
    }
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <MinimalLayout>
        <div className="flex flex-col h-full w-full overflow-y-auto">
          {/* Hero Section with Gradient Background */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="relative px-8 py-16 max-w-7xl mx-auto">
              {/* Welcome Header with Animation */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Rocket className="w-4 h-4" />
                  <span className="text-sm font-medium">Version 2.0 - Powered by AI</span>
                </div>
                <div className="flex items-center justify-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm">
                    <Command className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Code Pilot Studio
                    </h1>
                    <p className="text-xl text-muted-foreground">Your AI-Powered Development Companion</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  Build faster, code smarter, and ship with confidence. Experience the future of development 
                  with intelligent code assistance, powerful tools, and seamless workflows.
                </p>
              </div>

              {/* Quick Actions with Enhanced Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleNewProject}
                      className="h-auto p-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      variant="default"
                      size="lg"
                    >
                      <div className="flex flex-col gap-3 items-center">
                        <div className="p-3 rounded-lg bg-white/20">
                          <Plus className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-primary-foreground">New Project</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start a new project from templates</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleOpenProjectDialog}
                      className="h-auto p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all hover:scale-105 bg-card"
                      variant="outline"
                      size="lg"
                    >
                      <div className="flex flex-col gap-3 items-center">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <FolderOpen className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">Open Project</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open an existing project folder</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleOpenSettings}
                      className="h-auto p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all hover:scale-105 bg-card"
                      variant="outline"
                      size="lg"
                    >
                      <div className="flex flex-col gap-3 items-center">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">Settings</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure your preferences</p>
                  </TooltipContent>
                </Tooltip>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      className="h-auto p-6 relative border-2 border-dashed opacity-75 hover:opacity-100 transition-all bg-card"
                      variant="outline"
                      size="lg"
                      disabled
                    >
                      <div className="flex flex-col gap-3 items-center">
                        <Badge className="absolute -top-2 -right-2" variant="secondary">
                          Soon
                        </Badge>
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="font-semibold text-foreground">AI Assistant</span>
                      </div>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Claude AI Integration
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Coming soon: Get intelligent code suggestions, automated refactoring, 
                        and natural language programming assistance powered by Claude.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full">
            {/* Feature Highlights */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <Code2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Smart Code Editor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monaco-powered editor with syntax highlighting, IntelliSense, and multi-cursor support.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                      <Terminal className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">Integrated Terminal</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Full-featured terminal with multiple sessions, themes, and shell integration.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                      <GitBranch className="w-5 h-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">Git Integration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built-in Git support with visual diff, staging, and branch management.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator className="mb-12" />

            {/* Tabbed Content Section */}
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Projects
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recent Files
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity Feed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle>Your Projects</CardTitle>
                    <Button
                      onClick={() => navigate('/projects')}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Loading projects...</p>
                        </div>
                      </div>
                    ) : recentProjects.length > 0 ? (
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {recentProjects.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => handleOpenProject(project)}
                              className="group cursor-pointer p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all hover:shadow-md"
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <FolderOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold truncate">{project.name}</h3>
                                    {project.description && (
                                      <Badge variant="secondary" className="text-xs">
                                        <span className="flex items-center">
                                          <Star className="w-3 h-3 mr-1" />
                                          Featured
                                        </span>
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {project.path}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(project.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="p-4 rounded-full bg-muted">
                          <FolderOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground">No projects yet</p>
                          <p className="text-sm text-muted-foreground">Create your first project to get started</p>
                        </div>
                        <Button onClick={handleNewProject} size="sm">
                          <span className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                          </span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle>Recent Files</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="flex items-center gap-1"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {recentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all opacity-75"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-muted">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(file.modified)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Activity Feed</CardTitle>
                    <CardDescription>
                      Your recent development activity and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="p-4 rounded-full bg-muted">
                        <Activity className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">No activity yet</p>
                        <p className="text-sm text-muted-foreground">
                          Your coding activity will appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{recentProjects.length}</span>
                    <Badge variant="secondary" className="text-xs">
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Code Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">0</span>
                    <span className="text-sm text-muted-foreground">This week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Assists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">∞</span>
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">100%</span>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="mt-16 py-8 border-t">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <p className="text-sm text-muted-foreground">© 2024 Code Pilot Studio</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                      <a href="#">
                        <span className="flex items-center gap-1">
                          <Book className="w-4 h-4" />
                          Docs
                        </span>
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href="#">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Learn
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Dialog */}
        <StartProjectDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          templates={templates}
          onCreateProject={handleCreateProject}
          onOpenFolder={handleOpenProjectDialog}
          onCloneRepo={() => {
            // TODO: Implement clone repo functionality
            console.log('Clone repo not implemented yet');
          }}
        />
      </MinimalLayout>
    </TooltipProvider>
  );
};