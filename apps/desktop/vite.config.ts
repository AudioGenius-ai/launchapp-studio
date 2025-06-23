import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'suppress-dynamic-import-warnings',
      configureServer(server) {
        const warn = server.config.logger.warn;
        server.config.logger.warn = (msg, options) => {
          // Suppress dynamic import warnings from bundled packages
          if (msg.includes('The above dynamic import cannot be analyzed by Vite') &&
              msg.includes('packages/features/projects/dist')) {
            return;
          }
          warn(msg, options);
        };
      },
    },
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  // Build configuration using latest Vite standards
  build: {
    // Target modern browsers
    target: 'esnext',
    
    // Enable minification for production
    minify: 'esbuild',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Rollup configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      
      output: {
        // Use modern module format
        format: 'es',
        
        // Manual chunks for better code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimizations
  optimizeDeps: {
    // Pre-bundle dependencies for faster page load
    include: ['react', 'react-dom', 'react-router-dom'],
    
    // Exclude packages that have issues with pre-bundling
    exclude: ['@tauri-apps/api'],
  },
  
  // Environment variable handling
  define: {
    // Ensure proper environment variable replacement
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Module resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
}));