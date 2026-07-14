// frontend/src/pages/formations/langues/LangueDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { supabase } from "../../../supabaseClient";

// Configuration des langues
const LANGUES_CONFIG = {
  allemand: {
    id: "allemand",
    flag: "🇩🇪",
    niveaux: "A1 • A2 • B1",
    duree: "60h (A1) / 100h (B1)",
    certification: "Goethe • ÖSD",
    keywords: "allemand, Monastir, Goethe, ÖSD, certification",
    searchTitle: "Formation Allemand à Monastir",
    searchDescription: "Cours d'allemand certifiants à Monastir. Préparez les examens Goethe et ÖSD.",
    programme: [
      "Maîtrise des bases de la grammaire allemande",
      "Expression orale et écrite",
      "Compréhension et production de textes",
      "Préparation aux examens Goethe-Zertifikat et ÖSD",
      "Cours adaptés aux débutants et niveaux avancés"
    ]
  },
  anglais: {
    id: "anglais",
    flag: "🇬🇧",
    niveaux: "A1 à C1",
    duree: "60h à 120h",
    certification: "TOEIC • IELTS",
    keywords: "anglais, Monastir, TOEIC, IELTS, certification",
    searchTitle: "Formation Anglais à Monastir",
    searchDescription: "Cours d'anglais certifiants à Monastir. Préparez le TOEIC et l'IELTS.",
    programme: [
      "Communication professionnelle et quotidienne",
      "Grammaire et vocabulaire avancés",
      "Compréhension orale et écrite",
      "Préparation aux examens TOEIC et IELTS",
      "Cours d'anglais général et d'anglais des affaires"
    ]
  },
  espagnol: {
    id: "espagnol",
    flag: "🇪🇸",
    niveaux: "A1 • A2 • B1",
    duree: "60h à 100h",
    certification: "DELE",
    keywords: "espagnol, Monastir, DELE, certification, cours espagnol",
    searchTitle: "Formation Espagnol à Monastir",
    searchDescription: "Cours d'espagnol certifiants à Monastir. Préparez les examens DELE.",
    programme: [
      "Maîtrise de l'espagnol conversationnel",
      "Grammaire et conjugaison espagnole",
      "Culture hispanophone",
      "Préparation aux examens DELE",
      "Cours adaptés aux débutants et niveaux avancés"
    ]
  },
  francais: {
    id: "francais",
    flag: "🇫🇷",
    niveaux: "A1 à B2",
    duree: "60h à 100h",
    certification: "DELF • DALF",
    keywords: "français, Monastir, DELF, DALF, certification",
    searchTitle: "Formation Français à Monastir",
    searchDescription: "Cours de français certifiants à Monastir. Préparez le DELF et le DALF.",
    programme: [
      "Maîtrise du français professionnel et quotidien",
      "Grammaire et conjugaison avancées",
      "Expression écrite et orale",
      "Préparation aux examens DELF et DALF",
      "Cours de français général et français des affaires"
    ]
  },
  italien: {
    id: "italien",
    flag: "🇮🇹",
    niveaux: "A1 • A2 • B1 • B2",
    duree: "60h à 120h",
    certification: "CELI • PLIDA",
    keywords: "italien, Monastir, CELI, PLIDA, certification",
    searchTitle: "Formation Italien à Monastir",
    searchDescription: "Cours d'italien certifiants à Monastir. Préparez les examens CELI et PLIDA.",
    programme: [
      "Maîtrise de l'italien conversationnel et professionnel",
      "Grammaire et conjugaison italienne",
      "Culture et civilisation italiennes",
      "Préparation aux examens CELI et PLIDA",
      "Cours d'italien général et d'italien des affaires"
    ]
  }
};

// ✅ Map des noms de langues pour la recherche (gère les accents)
const SEARCH_TERMS = {
  allemand: 'Allemand',
  anglais: 'Anglais',
  espagnol: 'Espagnol',
  francais: 'Français',  // ✅ Avec cédille
  italien: 'Italien'
};

export default function LangueDetail() {
  const { langue } = useParams();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [langueConfig, setLangueConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = LANGUES_CONFIG[langue];
        if (!config) {
          setLoading(false);
          return;
        }
        setLangueConfig(config);

        // ✅ Utiliser SEARCH_TERMS pour gérer les accents
        const searchTerm = SEARCH_TERMS[langue] || config.id.charAt(0).toUpperCase() + config.id.slice(1);
        
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("theme", "langues")
          .ilike("title", `%${searchTerm}%`)
          .maybeSingle();

        if (!error && data) {
          setFormationData(data);
        } else {
          console.log("Aucune formation trouvée en base, utilisation des données par défaut");
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [langue]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const imageUrl = formationData?.images?.[0] 
    ? getImageUrl(formationData.images[0]) 
    : null;

  const title = formationData?.title || langueConfig?.searchTitle || `Formation ${langue} à Monastir`;
  const description = formationData?.description || langueConfig?.searchDescription || `Formation ${langue} à Monastir`;
  const fullDescription = formationData?.fullDescription || null;
  const duration = formationData?.duration || langueConfig?.duree;
  const price = formationData?.price || "Sur devis";
  const isOnline = formationData?.is_online ?? true;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  if (!langueConfig) {
    return (
      <div className="text-center py-20 mt-20">
        <h1 className="text-2xl font-bold text-gray-800">Langue non trouvée</h1>
        <Link to="/formations/langues" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux langues
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | Centre Certus Monastir</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={langueConfig.keywords} />
        <link rel="canonical" href={`https://centrecertusdeformation.tn/formation-${langue}-monastir`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://centrecertusdeformation.tn/formation-${langue}-monastir`} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">{langueConfig.flag}</span>
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          </div>
          
          <div className="mb-6 rounded-xl overflow-hidden shadow-md bg-gray-100 h-64 flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            ) : (
              <span className="text-6xl">{langueConfig.flag}</span>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Niveaux</p>
              <p className="text-xl font-bold text-blue-700">{langueConfig.niveaux}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Durée</p>
              <p className="text-xl font-bold text-green-700">{duration}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Certification</p>
              <p className="text-xl font-bold text-purple-700">{langueConfig.certification}</p>
            </div>
          </div>

          {description && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 Description</h2>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          )}

          {fullDescription && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{fullDescription}</div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Programme de la formation</h2>
          <ul className="space-y-2 text-gray-600 mb-6">
            {langueConfig.programme.map((item, index) => (
              <li key={index}>✅ {item}</li>
            ))}
          </ul>

          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200 mb-6">
            <p className="text-sm text-gray-600">Tarif</p>
            <p className="text-2xl font-bold text-gray-800">{price}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">📍 Informations pratiques</h3>
            <p>📅 Démarrage : Prochaine session bientôt</p>
            <p>💻 Modalité : {isOnline ? 'Présentiel ou à distance' : 'Présentiel'}</p>
            <p>📞 Contact : 54 582 980 | 54 582 982</p>
            <p>🏠 Avenue du combattant suprême, 5000 Monastir</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              to="/contact" 
              className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              📩 Demander un devis
            </Link>
            <Link 
              to="/inscription" 
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              📝 S'inscrire
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              ℹ️ Cette page est dynamique. Les données sont récupérées depuis Supabase.
              {formationData ? (
                <span className="ml-2 text-green-600">✓ Données synchronisées</span>
              ) : (
                <span className="ml-2 text-orange-500">⚠ Données par défaut</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}