import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { homeDir } from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-pilot/ui';
import { Button } from '@code-pilot/ui';
import { Input } from '@code-pilot/ui';
import { Label } from '@code-pilot/ui';
import { Checkbox } from '@code-pilot/ui';
import { ScrollArea } from '@code-pilot/ui';
import { Alert, AlertDescription } from '@code-pilot/ui';
import { Folder, Home, Code, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import { cn } from '@code-pilot/utils';

interface ProjectCreationWizardProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (options: ProjectCreationOptions) => Promise<void>;
}

interface ProjectCreationOptions {
  projectName: string;
  projectPath: string;
  gitInit: boolean;
  installDependencies: boolean;
  openInEditor: boolean;
}

interface CommandOutput {
  type: 'stdout' | 'stderr' | 'info';
  content: string;
}

export function ProjectCreationWizard({
  template,
  open,
  onOpenChange,
  onCreateProject,
}: ProjectCreationWizardProps) {
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [gitInit, setGitInit] = useState(true);
  const [installDependencies, setInstallDependencies] = useState(true);
  const [openInEditor, setOpenInEditor] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [commandOutput, setCommandOutput] = useState<CommandOutput[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Set default project path
  useEffect(() => {
    const setDefaultPath = async () => {
      if (open && !projectPath) {
        try {
          const home = await homeDir();
          setProjectPath(`${home}/Projects`);
        } catch (error) {
          setProjectPath('~/Projects');
        }
      }
    };
    setDefaultPath();
  }, [open, projectPath]);

  const handleSelectPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Location',
      });
      
      if (selected && typeof selected === 'string') {
        setProjectPath(selected);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const handleQuickPath = async (folder: string) => {
    try {
      const home = await homeDir();
      setProjectPath(`${home}/${folder}`);
    } catch (error) {
      console.error('Failed to get home directory:', error);
    }
  };

  const validateInputs = (): boolean => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return false;
    }
    if (!projectPath.trim()) {
      setError('Please select a project location');
      return false;
    }
    // Validate project name (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
      setError('Project name can only contain letters, numbers, hyphens, and underscores');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;

    setIsCreating(true);
    setError(null);
    setCommandOutput([]);

    // Set up event listeners for real-time output
    const unlistenOutput = await listen<string>('template:execution:output', (event) => {
      setCommandOutput((prev) => [...prev, { type: 'stdout', content: event.payload }]);
    });

    const unlistenError = await listen<string>('template:execution:error', (event) => {
      setCommandOutput((prev) => [...prev, { type: 'stderr', content: event.payload }]);
    });

    const unlistenCmdOutput = await listen<string>('command:execution:output', (event) => {
      setCommandOutput((prev) => [...prev, { type: 'stdout', content: event.payload }]);
    });

    const unlistenCmdError = await listen<string>('command:execution:error', (event) => {
      setCommandOutput((prev) => [...prev, { type: 'stderr', content: event.payload }]);
    });

    try {
      // Add initial info
      setCommandOutput((prev) => [
        ...prev,
        { type: 'info', content: `Creating project "${projectName}" from ${template.name} template...` },
      ]);

      const options: ProjectCreationOptions = {
        projectName,
        projectPath: `${projectPath}/${projectName}`,
        gitInit,
        installDependencies,
        openInEditor,
      };

      // Display command
      setCommandOutput((prev) => [
        ...prev,
        { type: 'stdout', content: `$ ${getFullCommand()}` },
      ]);

      await onCreateProject(options);

      // Success message
      setCommandOutput((prev) => [
        ...prev,
        { type: 'info', content: '✅ Project created successfully!' },
      ]);

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setCommandOutput((prev) => [
        ...prev,
        { type: 'stderr', content: `❌ Error: ${err}` },
      ]);
    } finally {
      setIsCreating(false);
      // Clean up event listeners
      unlistenOutput();
      unlistenError();
      unlistenCmdOutput();
      unlistenCmdError();
    }
  };

  const getFullCommand = () => {
    // For now, we'll use a generic create command based on the template
    // In a real implementation, this would use the template's specific creation method
    const packageManager = template.config?.packageManager || 'npm';
    const framework = template.config?.framework || 'react';
    
    if (packageManager === 'npm') {
      return `npx create-${framework}-app ${projectName || '<project-name>'}`;
    } else {
      return `${packageManager} create ${framework} ${projectName || '<project-name>'}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Configure your new {template.name} project
          </DialogDescription>
        </DialogHeader>

        {!isCreating ? (
          <>
            <div className="space-y-4 py-4">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Project Location */}
              <div className="space-y-2">
                <Label htmlFor="project-path">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="project-path"
                    placeholder="/path/to/projects"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    disabled={isCreating}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSelectPath}
                    disabled={isCreating}
                  >
                    <Folder className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPath('Projects')}
                    disabled={isCreating}
                  >
                    <Home className="w-3 h-3 mr-1" />
                    ~/Projects
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPath('Development')}
                    disabled={isCreating}
                  >
                    <Code className="w-3 h-3 mr-1" />
                    ~/Development
                  </Button>
                </div>
              </div>

              {/* Command Preview */}
              <div className="space-y-2">
                <Label>Command to execute</Label>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-muted-foreground" />
                  <code>{getFullCommand()}</code>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="git-init"
                    checked={gitInit}
                    onCheckedChange={(checked) => setGitInit(checked as boolean)}
                    disabled={isCreating}
                  />
                  <Label htmlFor="git-init" className="font-normal">
                    Initialize Git repository
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="install-deps"
                    checked={installDependencies}
                    onCheckedChange={(checked) => setInstallDependencies(checked as boolean)}
                    disabled={isCreating}
                  />
                  <Label htmlFor="install-deps" className="font-normal">
                    Install dependencies
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-editor"
                    checked={openInEditor}
                    onCheckedChange={(checked) => setOpenInEditor(checked as boolean)}
                    disabled={isCreating}
                  />
                  <Label htmlFor="open-editor" className="font-normal">
                    Open in editor when done
                  </Label>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !projectName || !projectPath}>
                Create Project
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Creation Progress */}
            <div className="py-4">
              <ScrollArea className="h-[300px] w-full rounded-lg bg-black p-4">
                <div className="space-y-1 font-mono text-sm">
                  {commandOutput.map((output, index) => (
                    <div
                      key={index}
                      className={cn(
                        'whitespace-pre-wrap',
                        output.type === 'stdout' && 'text-green-400',
                        output.type === 'stderr' && 'text-red-400',
                        output.type === 'info' && 'text-blue-400'
                      )}
                    >
                      {output.content}
                    </div>
                  ))}
                  {isCreating && (
                    <div className="flex items-center gap-2 text-yellow-400 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating project...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {error && (
              <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}