// frontend/src/utils/stringUtils.js

/**
 * Normalise une chaîne de caractères en supprimant les accents et en mettant en minuscules
 * Utile pour les recherches insensibles aux accents
 * 
 * @param {string} str - La chaîne à normaliser
 * @returns {string} La chaîne normalisée sans accents
 * 
 * @example
 * normalizeString("Français") // retourne "francais"
 * normalizeString("Élève")    // retourne "eleve"
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Recherche une formation dans un tableau par titre normalisé
 * 
 * @param {Array} formations - Tableau des formations
 * @param {string} searchTerm - Terme de recherche (sans accent de préférence)
 * @returns {Object|null} La formation trouvée ou null
 * 
 * @example
 * const found = searchInFormations(formations, "allemand");
 */
export const searchInFormations = (formations, searchTerm) => {
  if (!formations || !searchTerm) return null;
  
  const normalizedSearch = normalizeString(searchTerm);
  
  return formations.find(f => {
    const normalizedTitle = normalizeString(f.title);
    return normalizedTitle.includes(normalizedSearch);
  }) || null;
};

/**
 * Recherche une formation par ID
 * 
 * @param {Array} formations - Tableau des formations
 * @param {string} id - ID de la formation
 * @returns {Object|null} La formation trouvée ou null
 */
export const findFormationById = (formations, id) => {
  if (!formations || !id) return null;
  return formations.find(f => f.id === id) || null;
};

/**
 * Filtre les formations par thème
 * 
 * @param {Array} formations - Tableau des formations
 * @param {string} theme - Thème à filtrer
 * @returns {Array} Formations filtrées
 */
export const filterByTheme = (formations, theme) => {
  if (!formations) return [];
  if (!theme || theme === 'all') return formations;
  return formations.filter(f => f.theme === theme);
};

/**
 * Trie les formations par date de création (plus récentes en premier)
 * 
 * @param {Array} formations - Tableau des formations
 * @returns {Array} Formations triées
 */
export const sortByDate = (formations) => {
  if (!formations) return [];
  return [...formations].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
};

/**
 * Extrait l'URL d'image depuis Supabase
 * 
 * @param {string} path - Chemin de l'image dans Supabase Storage
 * @param {string} supabaseUrl - URL de Supabase
 * @returns {string|null} URL complète de l'image ou null
 */
export const getImageUrl = (path, supabaseUrl) => {
  if (!path || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/uploads/${path}`;
};

/**
 * Génère un slug SEO à partir d'un titre
 * 
 * @param {string} title - Titre de la formation
 * @returns {string} Slug SEO
 * 
 * @example
 * generateSlug("Formation Allemand à Monastir") // retourne "formation-allemand-monastir"
 */
export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Extrait le nom de la langue à partir du titre
 * 
 * @param {string} title - Titre de la formation
 * @param {Array} languages - Liste des langues à rechercher
 * @returns {string|null} Nom de la langue trouvée ou null
 */
export const extractLanguage = (title, languages = ['allemand', 'anglais', 'espagnol', 'francais', 'italien']) => {
  if (!title) return null;
  const normalizedTitle = normalizeString(title);
  for (const lang of languages) {
    if (normalizedTitle.includes(lang)) {
      return lang;
    }
  }
  return null;
};