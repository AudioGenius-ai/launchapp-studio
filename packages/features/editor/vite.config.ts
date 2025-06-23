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
      name: 'CodePilotFeatureEditor',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@monaco-editor/react',
        'monaco-editor',
        /^@code-pilot\//
      ],
      treeshake: false
    },
    sourcemap: true,
    emptyOutDir: true
  }
});