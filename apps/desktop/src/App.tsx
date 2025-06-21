import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ProjectsPage } from './features/projects';
import { EditorPage } from './features/editor/EditorPage';
import { SettingsPage } from './features/settings/SettingsPage';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
          <div className="px-4 py-2">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Projects
              </Link>
              <Link 
                to="/editor" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Editor
              </Link>
              <Link 
                to="/settings" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Settings
              </Link>
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
  );
}

export default App;
