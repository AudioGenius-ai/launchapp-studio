import React, { useEffect, useState } from 'react';
import { MinimalLayout } from '@code-pilot/ui';
import { windowManager } from '@code-pilot/core';
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
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentFiles, setRecentFiles] = useState<{ path: string; name: string; modified: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      setLoading(true);
      
      // Load recent projects
      const projectsResponse = await invoke<ProjectListResponse>('list_projects');
      // Sort by updatedAt and take the first 5
      const sortedProjects = projectsResponse.projects
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
    navigate('/projects');
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
    <MinimalLayout title="Welcome to Code Pilot Studio">
      <div className="home-page">
        {/* Welcome Header */}
        <div className="home-page__header">
          <div className="home-page__logo">
            <div className="home-page__logo-icon">
              <Command size={48} />
            </div>
            <div className="home-page__logo-content">
              <h1 className="home-page__title">Code Pilot Studio</h1>
              <p className="home-page__subtitle">AI-Powered Development Environment</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="home-page__actions">
          <button
            onClick={handleNewProject}
            className="home-page__action-card home-page__action-card--primary"
          >
            <Plus size={24} />
            <span>New Project</span>
          </button>
          <button
            onClick={handleOpenProjectDialog}
            className="home-page__action-card"
          >
            <FolderOpen size={24} />
            <span>Open Project</span>
          </button>
          <button
            onClick={handleOpenSettings}
            className="home-page__action-card"
          >
            <Settings size={24} />
            <span>Settings</span>
          </button>
          <button
            className="home-page__action-card home-page__action-card--ai"
            disabled
          >
            <Sparkles size={24} />
            <span>AI Assistant</span>
            <span className="home-page__badge">Coming Soon</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="home-page__content">
          {/* Recent Projects */}
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">
                <Clock size={20} />
                Recent Projects
              </h2>
              <button
                onClick={() => navigate('/projects')}
                className="home-page__section-action"
              >
                View All
                <ExternalLink size={16} />
              </button>
            </div>
            
            {loading ? (
              <div className="home-page__loading">Loading recent projects...</div>
            ) : recentProjects.length > 0 ? (
              <div className="home-page__project-list">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleOpenProject(project)}
                    className="home-page__project-item"
                  >
                    <div className="home-page__project-icon">
                      <FolderOpen size={20} />
                    </div>
                    <div className="home-page__project-info">
                      <h3 className="home-page__project-name">{project.name}</h3>
                      <p className="home-page__project-path">{project.path}</p>
                      <p className="home-page__project-time">
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    {project.description && (
                      <Star size={16} className="home-page__project-star" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="home-page__empty">
                <p>No recent projects</p>
                <button onClick={handleNewProject} className="home-page__empty-action">
                  Create your first project
                </button>
              </div>
            )}
          </section>

          {/* Recent Files */}
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">
                <FileText size={20} />
                Recent Files
              </h2>
              <button className="home-page__section-action" disabled>
                <Search size={16} />
                Search Files
              </button>
            </div>
            
            <div className="home-page__file-list">
              {recentFiles.map((file, index) => (
                <button
                  key={index}
                  className="home-page__file-item"
                  disabled
                >
                  <FileText size={16} />
                  <span className="home-page__file-name">{file.name}</span>
                  <span className="home-page__file-time">
                    {formatDate(file.modified)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MinimalLayout>
  );
};