import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'feature_explorer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        '@tauri-apps/api', 
        'lucide-react',
        /^@code-pilot\//
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@code-pilot/core': resolve(__dirname, '../../core/src'),
      '@code-pilot/types': resolve(__dirname, '../../types/src'),
      '@code-pilot/ui': resolve(__dirname, '../../ui/src'),
      '@code-pilot/utils': resolve(__dirname, '../../utils/src'),
      '@code-pilot/services': resolve(__dirname, '../../services/src'),
    }
  }
});
