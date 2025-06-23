import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodePilotServices',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        '@tauri-apps/api',
        '@tauri-apps/plugin-fs',
        /^@code-pilot\//
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
});