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
    // ✅ Désactiver le cache en développement
    hmr: {
      overlay: true,
    },
    // ✅ Forcer le rechargement des fichiers
    watch: {
      usePolling: true,
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    // ✅ Ajouter des hashs aux noms de fichiers pour éviter le cache
    rollupOptions: {
      output: {
        // ✅ Hash dans les noms de fichiers pour le cache-busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'swiper'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'emailjs-vendor': ['@emailjs/browser'],
          // ✅ Séparer les utilitaires
          'utils-vendor': ['react-toastify', 'react-helmet-async'],
        }
      }
    },
    // ✅ Générer un manifeste pour suivre les fichiers
    manifest: true,
  },
  
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion', 
      'swiper',
      '@supabase/supabase-js',
      'react-toastify',
      'react-helmet-async'
    ],
    // ✅ Forcer l'optimisation des dépendances
    force: true,
  },
  
  // ✅ Configuration pour les assets
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  
  define: {
    'process.env': {},
    // ✅ Version de build pour le cache-busting
    '__BUILD_VERSION__': JSON.stringify(Date.now()),
  },
  
  // ✅ Configuration ESLint (optionnel)
  esbuild: {
    // ✅ Supprime les logs de production (optionnel)
    // drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});