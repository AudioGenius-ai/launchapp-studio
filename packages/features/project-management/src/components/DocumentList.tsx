import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  FolderOpen, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  Calendar,
  User,
  Tag,
  Grid,
  List,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useProjectManagementStore } from '../stores';
import type { Document, DocumentTemplate, DocumentStatus } from '../types';

interface DocumentListProps {
  projectId: string;
}

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onDocumentClick: (documentId: string) => void;
  onDocumentAction: (documentId: string, action: 'edit' | 'delete' | 'star') => void;
}

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

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  viewMode, 
  onDocumentClick, 
  onDocumentAction 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleActionClick = (e: React.MouseEvent, action: 'edit' | 'delete' | 'star') => {
    e.stopPropagation();
    onDocumentAction(document.id, action);
    setShowActions(false);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onDocumentClick(document.id)}
        className="p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-lg">{getTemplateIcon(document.template)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                {document.title}
              </h3>
              <div className="flex items-center space-x-4 mt-1 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span>{document.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{format(new Date(document.updated_at), 'MMM d, yyyy')}</span>
                </div>
                <span 
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: getStatusColor(document.status) + '20',
                    color: getStatusColor(document.status),
                  }}
                >
                  {document.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--color-backgroundSecondary)',
                  color: 'var(--color-foregroundSecondary)',
                }}
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--color-backgroundSecondary)',
                  color: 'var(--color-foregroundSecondary)',
                }}
              >
                +{document.tags.length - 2}
              </span>
            )}
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showActions && (
                <div 
                  className="absolute right-0 top-8 w-48 py-2 rounded-lg shadow-lg border z-10"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <button
                    onClick={(e) => handleActionClick(e, 'edit')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'star')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Star size={14} />
                    <span>Star</span>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'delete')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onDocumentClick(document.id)}
      className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTemplateIcon(document.template)}</span>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStatusColor(document.status) }}
          />
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showActions && (
            <div 
              className="absolute right-0 top-8 w-48 py-2 rounded-lg shadow-lg border z-10"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                onClick={(e) => handleActionClick(e, 'edit')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, 'star')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Star size={14} />
                <span>Star</span>
              </button>
              <button
                onClick={(e) => handleActionClick(e, 'delete')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="font-medium mb-2 line-clamp-2" style={{ color: 'var(--color-foreground)' }}>
        {document.title}
      </h3>
      
      <div className="text-sm mb-3" style={{ color: 'var(--color-foregroundSecondary)' }}>
        <div className="flex items-center space-x-1 mb-1">
          <User size={12} />
          <span>{document.author}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar size={12} />
          <span>{format(new Date(document.updated_at), 'MMM d')}</span>
        </div>
      </div>
      
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                color: 'var(--color-foregroundSecondary)',
              }}
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                color: 'var(--color-foregroundSecondary)',
              }}
            >
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const DocumentList: React.FC<DocumentListProps> = ({ projectId }) => {
  const {
    documents,
    documentFilter,
    setSelectedDocument,
    deleteDocument,
    loadDocuments,
  } = useProjectManagementStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState({
    status: [] as DocumentStatus[],
    template: [] as DocumentTemplate[],
    tags: [] as string[],
  });

  useEffect(() => {
    loadDocuments(projectId, documentFilter);
  }, [projectId, documentFilter]);

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  const handleDocumentAction = async (documentId: string, action: 'edit' | 'delete' | 'star') => {
    switch (action) {
      case 'edit':
        setSelectedDocument(documentId);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this document?')) {
          await deleteDocument(projectId, documentId);
        }
        break;
      case 'star':
        // TODO: Implement starring functionality
        console.log('Star document:', documentId);
        break;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (localFilter.status.length > 0 && !localFilter.status.includes(doc.status)) {
      return false;
    }
    if (localFilter.template.length > 0 && !localFilter.template.includes(doc.template)) {
      return false;
    }
    if (localFilter.tags.length > 0 && !localFilter.tags.some(tag => doc.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div 
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors ${
              showFilters
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={{ borderColor: showFilters ? undefined : 'var(--color-border)' }}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        <div className="text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
          {filteredDocuments.length} of {documents.length} documents
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div 
          className="p-4 border-b"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
                Status
              </label>
              <div className="space-y-2">
                {(['draft', 'published', 'archived'] as DocumentStatus[]).map((status) => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilter.status.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilter(prev => ({
                            ...prev,
                            status: [...prev.status, status]
                          }));
                        } else {
                          setLocalFilter(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize" style={{ color: 'var(--color-foreground)' }}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Template Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
                Template
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(['page', 'blog', 'requirements', 'api_doc', 'meeting', 'troubleshooting', 'user_guide', 'technical_spec'] as DocumentTemplate[]).map((template) => (
                  <label key={template} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilter.template.includes(template)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilter(prev => ({
                            ...prev,
                            template: [...prev.template, template]
                          }));
                        } else {
                          setLocalFilter(prev => ({
                            ...prev,
                            template: prev.template.filter(t => t !== template)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize" style={{ color: 'var(--color-foreground)' }}>
                      {template.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
                Tags
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilter.tags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilter(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                        } else {
                          setLocalFilter(prev => ({
                            ...prev,
                            tags: prev.tags.filter(t => t !== tag)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document List/Grid */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                viewMode={viewMode}
                onDocumentClick={handleDocumentClick}
                onDocumentAction={handleDocumentAction}
              />
            ))}
          </div>
        ) : (
          <div>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                viewMode={viewMode}
                onDocumentClick={handleDocumentClick}
                onDocumentAction={handleDocumentAction}
              />
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--color-foregroundSecondary)' }} />
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>
                No documents found
              </p>
              <p className="text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                {documents.length === 0 
                  ? 'Create your first document to get started'
                  : 'Try adjusting your filters'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};