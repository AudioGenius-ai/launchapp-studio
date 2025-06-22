import React, { useState } from 'react';
import { X, FileText, Tag } from 'lucide-react';
import { useProjectManagementStore } from '../stores';
import { DocumentTemplate } from '../types';

interface CreateDocumentDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDocumentDialog: React.FC<CreateDocumentDialogProps> = ({ 
  projectId, 
  isOpen, 
  onClose 
}) => {
  const { createDocument } = useProjectManagementStore();
  
  const [formData, setFormData] = useState({
    title: '',
    template: 'page' as DocumentTemplate,
    tags: [] as string[],
  });
  
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const templates = [
    { value: 'page', label: 'Page', icon: '📄' },
    { value: 'blog', label: 'Blog Post', icon: '📝' },
    { value: 'requirements', label: 'Requirements', icon: '📋' },
    { value: 'api_doc', label: 'API Documentation', icon: '🔌' },
    { value: 'meeting', label: 'Meeting Notes', icon: '🤝' },
    { value: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { value: 'user_guide', label: 'User Guide', icon: '📖' },
    { value: 'technical_spec', label: 'Technical Spec', icon: '⚙️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await createDocument(projectId, {
        title: formData.title,
        content: '', // Will be filled by template
        template: formData.template,
        tags: formData.tags,
        permissions: {
          read: [],
          write: [],
          admin: [],
        },
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        template: 'page',
        tags: [],
      });
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-lg w-full max-w-lg"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
            Create New Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)',
              }}
              placeholder="Enter document title..."
              required
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
              <FileText size={16} className="inline mr-1" />
              Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <label
                  key={template.value}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.template === template.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{ borderColor: formData.template === template.value ? '#3b82f6' : 'var(--color-border)' }}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.value}
                    checked={formData.template === template.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value as DocumentTemplate }))}
                    className="sr-only"
                  />
                  <span className="text-lg">{template.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                    {template.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            
            {/* Existing Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-sm rounded-full"
                  style={{
                    backgroundColor: 'var(--color-backgroundSecondary)',
                    color: 'var(--color-foreground)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 p-2 border rounded"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
                placeholder="Add tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};