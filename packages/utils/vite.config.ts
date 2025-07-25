import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodePilotUtils',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        /^@code-pilot\//
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
});