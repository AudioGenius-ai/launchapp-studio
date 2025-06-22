import React, { useState, useEffect } from 'react';
import { CreateProjectDto, Project } from '@code-pilot/types';
import { Button, Input, Label } from '@code-pilot/ui';
import { Folder } from 'lucide-react';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectDto) => void | Promise<void>;
  onCancel: () => void;
  onSelectDirectory?: () => Promise<string | null>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        path: project.path,
        description: project.description || '',
        settings: project.settings
      });
    }
  }, [project]);

  const handleSelectDirectory = async () => {
    if (onSelectDirectory) {
      const dir = await onSelectDirectory();
      if (dir) {
        setFormData(prev => ({ ...prev, path: dir }));
        setErrors(prev => ({ ...prev, path: '' }));
      }
    }
  };

  const validate = (): boolean => {
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
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Awesome Project"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="path">Project Location</Label>
        <div className="flex gap-2">
          <Input
            id="path"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            placeholder="/path/to/project"
            className={`flex-1 ${errors.path ? 'border-red-500' : ''}`}
          />
          {onSelectDirectory && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectDirectory}
            >
              <Folder className="w-4 h-4" />
            </Button>
          )}
        </div>
        {errors.path && (
          <p className="text-sm text-red-500 mt-1">{errors.path}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="A brief description of your project"
        />
      </div>


      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.settings?.gitEnabled ?? true}
            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings!, gitEnabled: e.target.checked } })}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm">Initialize Git repository</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.settings?.extensions?.includes('autosave') ?? false}
            onChange={(e) => {
              const extensions = formData.settings?.extensions || [];
              if (e.target.checked) {
                setFormData({ ...formData, settings: { ...formData.settings!, extensions: [...extensions, 'autosave'] } });
              } else {
                setFormData({ ...formData, settings: { ...formData.settings!, extensions: extensions.filter(ext => ext !== 'autosave') } });
              }
            }}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm">Enable auto-save</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};