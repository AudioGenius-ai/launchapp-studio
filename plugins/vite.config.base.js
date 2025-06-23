import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Base Vite configuration for Tauri plugins
 * This configuration should be extended by individual plugins
 */
export function createPluginConfig(pluginName, additionalConfig = {}) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(process.cwd(), 'src-js/index.ts'),
        name: pluginName,
        fileName: 'index',
        formats: ['es', 'cjs']
      },
      outDir: 'dist-js',
      sourcemap: true,
      minify: false, // Keep readable for debugging
      rollupOptions: {
        external: ['@tauri-apps/api'],
        output: {
          globals: {
            '@tauri-apps/api': 'TauriAPI'
          }
        }
      }
    },
    esbuild: {
      target: 'es2020'
    },
    ...additionalConfig
  });
}

export default createPluginConfig('TauriPlugin');