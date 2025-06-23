import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodePilotHooks',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@tauri-apps/api',
        /^@code-pilot\//
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
});