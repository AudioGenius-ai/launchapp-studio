import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import { mainWindowRoutes, projectWindowRoutes, devRoutes } from './routes';
import { AppStartup } from './startup';
import { MainShell } from '../shells/MainShell';
import { IDEShell } from '../shells/IDEShell';

function AppContent() {
  // Initialize application on mount
  useEffect(() => {
    AppStartup.initialize().catch(console.error);
    AppStartup.setupErrorHandling();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Main window routes with MainShell */}
        {mainWindowRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <MainShell>
                {route.element}
              </MainShell>
            }
          />
        ))}
        
        {/* Project window routes with IDEShell */}
        {projectWindowRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <IDEShell>
                {route.element}
              </IDEShell>
            }
          />
        ))}
        
        {/* Development routes - temporary */}
        <Route path="/editor" element={<IDEShell />}>
          <Route index element={devRoutes[0].element} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

export default App;