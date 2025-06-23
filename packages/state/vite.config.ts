import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodePilotState',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'zustand',
        'zustand/middleware',
        /^@code-pilot\//
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
});