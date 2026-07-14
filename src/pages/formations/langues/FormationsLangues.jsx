// frontend/src/pages/formations/langues/FormationsLangues.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Configuration Supabase directe
const SUPABASE_URL = 'https://rdttnpdjeuteeuwvggai.supabase.co';
const SUPABASE_KEY = 'sb_publishable__KLqCBiq6w5S-4jhoR2bYQ_HB8IVPpT';

// Map des langues vers les URLs SEO
const LANG_ROUTES = {
  allemand: '/formation-allemand-monastir',
  anglais: '/formation-anglais-monastir',
  espagnol: '/formation-espagnol-monastir',
  francais: '/formation-francais-monastir',
  italien: '/formation-italien-monastir'
};

export default function FormationsLangues() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/formations?select=*&theme=eq.langues&order=created_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log("📚 Formations en langues chargées:", data.length);
        setFormations(data || []);
      } catch (err) {
        console.error("Erreur chargement formations langues:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
  };

  const getLangRoute = (formation) => {
    const title = formation.title.toLowerCase();
    // ✅ Vérifier d'abord les correspondances exactes
    for (const [key, route] of Object.entries(LANG_ROUTES)) {
      if (title.includes(key)) {
        return route;
      }
    }
    // Fallback vers l'URL standard
    return `/formations/${formation.id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Formations en Langues | Centre Certus Monastir</title>
        <meta 
          name="description" 
          content="Découvrez nos formations en langues à Monastir : Allemand, Anglais, Espagnol, Français, Italien. Certifications Goethe, TOEIC, DELE, DELF. Présentiel ou à distance." 
        />
        <link rel="canonical" href="https://centrecertusdeformation.tn/formations/langues" />
        <meta property="og:title" content="Formations en Langues | Centre Certus Monastir" />
        <meta property="og:description" content="Formations en langues certifiantes à Monastir. Allemand, Anglais, Espagnol, Français, Italien." />
        <meta property="og:url" content="https://centrecertusdeformation.tn/formations/langues" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">🌍 Formations en Langues</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Apprenez une nouvelle langue avec Certus. Formations certifiantes pour tous niveaux,
              encadrées par des formateurs natifs et experts.
            </p>
            <p className="text-sm text-gray-400 mt-2">{formations.length} formation(s) disponible(s)</p>
          </div>

          {formations.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-gray-500">Aucune formation en langues disponible pour le moment.</p>
              <p className="text-sm text-gray-400 mt-2">Revenez bientôt pour découvrir nos nouvelles offres.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((formation) => (
                <motion.div
                  key={formation.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all"
                  onClick={() => navigate(getLangRoute(formation))}
                >
                  {formation.images && formation.images.length > 0 && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={getImageUrl(formation.images[0])}
                        alt={formation.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x300?text=📚";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {formation.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {formation.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>🎓 {formation.duration || "Durée flexible"}</span>
                        {formation.is_online && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">💻 En ligne</span>
                        )}
                        {formation.onDemand && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">🏢 Présentiel</span>
                        )}
                      </div>
                      <span className="text-blue-600 font-semibold text-sm hover:underline">
                        Voir →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Informations pratiques */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-2xl border border-gray-200">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-bold text-gray-800">📍 Lieu</h3>
                <p className="text-gray-600 text-sm">Avenue du combattant suprême<br />5000 Monastir Centre ville</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">📞 Contact</h3>
                <p className="text-gray-600 text-sm">54 582 980<br />54 582 982</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">💻 Modalité</h3>
                <p className="text-gray-600 text-sm">Présentiel ou à distance<br />Formation continue</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}