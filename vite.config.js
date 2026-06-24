// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'swiper'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'emailjs-vendor': ['@emailjs/browser'],
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'swiper']
  },
  
  define: {
    'process.env': {},
  },
});