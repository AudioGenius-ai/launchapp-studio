import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Save, 
  Eye, 
  Edit, 
  X, 
  MoreHorizontal, 
  Tag, 
  Calendar, 
  User,
  FileText,
  Settings,
  History,
  Share,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { useProjectManagementStore } from '../stores';
import type { Document, DocumentStatus, DocumentTemplate } from '../types';

interface DocumentEditorProps {
  documentId: string;
  projectId: string;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentId, projectId }) => {
  const {
    documents,
    setSelectedDocument,
    updateDocument,
  } = useProjectManagementStore();

  const [document, setDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setDocument(doc);
      setContent(doc.content);
      setTitle(doc.title);
      setTags(doc.tags);
      setStatus(doc.status);
    }
  }, [documentId, documents]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      await updateDocument(projectId, documentId, {
        title,
        content,
        tags,
        status,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (document) {
      setContent(document.content);
      setTitle(document.title);
      setTags(document.tags);
      setStatus(document.status);
    }
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getTemplateIcon = (template: DocumentTemplate) => {
    switch (template) {
      case 'page':
        return '📄';
      case 'blog':
        return '📝';
      case 'requirements':
        return '📋';
      case 'api_doc':
        return '🔌';
      case 'meeting':
        return '🤝';
      case 'troubleshooting':
        return '🔧';
      case 'user_guide':
        return '📖';
      case 'technical_spec':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return '#f59e0b';
      case 'published':
        return '#10b981';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--color-foregroundSecondary)' }} />
          <p style={{ color: 'var(--color-foregroundSecondary)' }}>Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getTemplateIcon(document.template)}</span>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium bg-transparent border-none outline-none"
                style={{ color: 'var(--color-foreground)' }}
                placeholder="Document title..."
              />
            ) : (
              <h1 className="text-lg font-medium" style={{ color: 'var(--color-foreground)' }}>
                {document.title}
              </h1>
            )}
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
              <span 
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: getStatusColor(document.status) + '20',
                  color: getStatusColor(document.status),
                }}
              >
                {document.status}
              </span>
              <span>•</span>
              <span>{document.template.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm transition-colors"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Document info"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div 
          className="p-4 border-b space-y-4"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
                Author
              </label>
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                <User size={14} />
                <span>{document.author}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
                Last Updated
              </label>
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                <Calendar size={14} />
                <span>{format(new Date(document.updated_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>

          {/* Status Editor */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-foreground)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span>{tag}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <div className="h-full">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height="100%"
              data-color-mode="auto"
              style={{
                backgroundColor: 'var(--color-background)',
              }}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div 
              className="prose prose-sm max-w-none"
              style={{ color: 'var(--color-foreground)' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {document.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {!isEditing && (
        <div 
          className="flex items-center justify-between p-4 border-t"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
            <span>Created {format(new Date(document.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
              title="Document history"
            >
              <History size={16} />
              <span>History</span>
            </button>
            
            <button
              className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
              title="Share document"
            >
              <Share size={16} />
              <span>Share</span>
            </button>
            
            <button
              className="flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
              title="Download document"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};