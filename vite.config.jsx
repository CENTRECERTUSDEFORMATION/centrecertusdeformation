import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de Vite
export default defineConfig({
  plugins: [react()], // Utilisation du plugin React pour la gestion de JSX

  // Résolution des chemins d'importation
  resolve: {
    alias: {
      '@': '/src',  // Alias pour les imports depuis le dossier src
    },
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,  // Définit le port du serveur à 3000
    open: true,  // Ouvre automatiquement le navigateur à l'ouverture du serveur
    proxy: {
      '/api': 'http://localhost:5000', // Proxy pour les requêtes vers l'API (si nécessaire)
    },
  },

  // Configuration de la construction du projet (build)
  build: {
    outDir: 'dist',  // Dossier de sortie pour la version construite
    sourcemap: true, // Générer des sourcemaps pour faciliter le debug en production
  },

  // Optimisation et configuration de la gestion des dépendances externes
  optimizeDeps: {
    include: ['clsx', 'axios', 'react-router-dom'], // Dépendances externes à inclure dans l'optimisation
  },

  // Configuration de l'environnement (facultatif)
  define: {
    'process.env': {},  // Vérifiez si nécessaire, ou supprimez si inutile
  },
});
