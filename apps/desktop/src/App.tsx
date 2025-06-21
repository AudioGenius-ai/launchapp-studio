import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CompactThemeSwitcher } from '@launchapp/ui';
import { ProjectsPage } from './features/projects';
import { EditorPage } from './features/editor/EditorPage';
import { SettingsPage } from './features/settings/SettingsPage';
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultMode="system" enableTransitions={true}>
      <Router>
        <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
          {/* Navigation Bar */}
          <nav style={{ backgroundColor: 'var(--color-backgroundSecondary)', borderBottom: '1px solid var(--color-border)' }}>
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Link 
                    to="/" 
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-foregroundSecondary)' }}
                  >
                    Projects
                  </Link>
                  <Link 
                    to="/editor" 
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-foregroundSecondary)' }}
                  >
                    Editor
                  </Link>
                  <Link 
                    to="/settings" 
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-foregroundSecondary)' }}
                  >
                    Settings
                  </Link>
                </div>
                <CompactThemeSwitcher />
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<ProjectsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
