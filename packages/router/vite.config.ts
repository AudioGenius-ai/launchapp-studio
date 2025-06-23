import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodePilotRouter',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        /^@code-pilot\//
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
});