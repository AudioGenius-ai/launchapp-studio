import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FolderOpen, GitBranch } from 'lucide-react';
import { CreateProjectDto } from '@code-pilot/types';
import { cn } from '../../utils/cn';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (dto: CreateProjectDto) => Promise<void>;
  onSelectDirectory?: () => Promise<string | null>;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject,
  onSelectDirectory
}) => {
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    path: '',
    description: '',
    settings: {
      gitEnabled: true,
      defaultBranch: 'main',
      extensions: []
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectDirectory = async () => {
    if (onSelectDirectory) {
      const path = await onSelectDirectory();
      if (path) {
        setFormData(prev => ({ ...prev, path }));
        // Auto-fill name if empty
        if (!formData.name) {
          const folderName = path.split('/').pop() || path.split('\\').pop() || '';
          setFormData(prev => ({ ...prev, name: folderName }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.path.trim()) {
      newErrors.path = 'Project path is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onCreateProject(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        path: '',
        description: '',
        settings: {
          gitEnabled: true,
          defaultBranch: 'main',
          extensions: []
        }
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
        
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] 
                                   w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                                   data-[state=open]:animate-contentShow">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Project
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg",
                    "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.name 
                      ? "border-red-500" 
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  placeholder="My Awesome Project"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Project Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Directory
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    className={cn(
                      "flex-1 px-3 py-2 border rounded-lg font-mono text-sm",
                      "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
                      "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors.path 
                        ? "border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    placeholder="/path/to/project"
                  />
                  {onSelectDirectory && (
                    <button
                      type="button"
                      onClick={handleSelectDirectory}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>
                {errors.path && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.path}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="A brief description of your project..."
                />
              </div>

              {/* Git Settings */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings?.gitEnabled ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, gitEnabled: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 
                             focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable Git integration
                  </span>
                </label>

                {formData.settings?.gitEnabled && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Branch
                    </label>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.settings?.defaultBranch || 'main'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings!, defaultBranch: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                           transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};