import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de Vite
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // 🔥 SUPPRIMÉ : proxy vers localhost
  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  optimizeDeps: {
    include: ['clsx', 'react-router-dom'], // ❌ axios supprimé
  },

  define: {
    'process.env': {},
  },
});