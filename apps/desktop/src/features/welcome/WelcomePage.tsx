import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, FolderOpen, Settings, Sparkles, Code2, GitBranch, Terminal, Zap } from 'lucide-react';
import { CompactThemeSwitcher } from '@code-pilot/ui';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Command size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Code Pilot Studio</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
              </div>
            </div>
            <CompactThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex items-center justify-center">
        <div className="relative w-full max-w-5xl mx-auto px-6">
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          </div>

          <div className="relative z-10">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-block relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Command size={64} className="text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles size={24} className="text-yellow-900" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Code Pilot Studio
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Your AI-powered development environment for building amazing software
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <button
                onClick={() => navigate('/')}
                className="group bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-xl text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderOpen size={28} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Open Projects
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create new projects or open existing ones to start coding
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="group bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 hover:shadow-xl text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings size={28} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Customize Settings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure editor preferences, themes, and keybindings
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Code2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Smart Editor</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monaco-powered editor with IntelliSense
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Zap size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Assistant</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Claude AI integration for coding help
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Git Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full version control support
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Terminal size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Integrated Terminal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built-in terminal with shell support
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>© 2025 Code Pilot Studio</span>
          <span>Built with Tauri + React</span>
        </div>
      </footer>
    </div>
  );
};