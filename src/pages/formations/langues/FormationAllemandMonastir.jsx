// frontend/src/pages/formations/langues/FormationAllemandMonastir.jsx
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { normalizeString } from "../../../utils/stringUtils";

// URL de base pour les images Supabase
const SUPABASE_URL = 'https://rdttnpdjeuteeuwvggai.supabase.co';

export default function FormationAllemandMonastir() {
  const [imageUrl, setImageUrl] = useState(null);
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour obtenir l'URL de l'image
  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur chargement image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("theme", "langues");

        if (error) {
          console.error("Erreur fetch formation:", error);
          setLoading(false);
          return;
        }

        // Recherche par slug ou par titre
        const found = data?.find(f => {
          // Vérifier par slug
          if (f.slug === "allemand-goethe-osd-monastir") return true;
          // Vérifier par titre (normalisé)
          const normalizedTitle = normalizeString(f.title || '');
          return normalizedTitle.includes("allemand") || normalizedTitle.includes("allemande");
        });

        if (found) {
          setFormationData(found);
          if (found?.images?.length > 0) {
            const url = getImageUrl(found.images[0]);
            setImageUrl(url);
          }
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Utiliser les données de la formation ou des valeurs par défaut
  const title = formationData?.title || "Allemand - Certifications Goethe & ÖSD";
  const fullTitle = formationData?.fullTitle || "Formation Allemand - Certifications Goethe & ÖSD";
  const description = formationData?.description || "Cours d'allemand A1 à B1. Préparez les examens Goethe et ÖSD. Présentiel ou à distance.";
  const duration = formationData?.duration || "60h (A1) / 100h (B1)";
  const price = formationData?.price || "Sur devis";
  const fullDescription = formationData?.fullDescription || null;
  const isOnline = formationData?.is_online || true;
  const onDemand = formationData?.onDemand || true;
  const hasTest = formationData?.has_test || true;
  const testFree = formationData?.test_free || true;

  // Image par défaut si aucune image n'est trouvée
  const defaultImage = getImageUrl("formations/allemand-formation-monastir-certus.webp");

  return (
    <>
      <Helmet>
        <title>{fullTitle} | Centre Certus Monastir</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="allemand Monastir, cours allemand, Goethe, ÖSD, certification allemand, formation allemand" />
        <link rel="canonical" href="https://centrecertusdeformation.tn/formation-allemand-monastir" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://centrecertusdeformation.tn/formation-allemand-monastir" />
        <meta property="og:type" content="website" />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        {!imageUrl && defaultImage && <meta property="og:image" content={defaultImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Image d'en-tête */}
          <div className="relative h-80 bg-gradient-to-r from-[#1a56db] to-[#76c21f] overflow-hidden">
            {(imageUrl || defaultImage) ? (
              <img 
                src={imageUrl || defaultImage} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-8xl">🇩🇪</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🇩🇪</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
              <div className="flex items-center gap-4">
                <span className="text-5xl">🇩🇪</span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
                  <p className="text-blue-100 text-sm">Centre Certus de Formation • Monastir</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">🗣️ Langues</span>
              {isOnline && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">🌍 En ligne</span>
              )}
              {onDemand && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">🏢 Présentiel</span>
              )}
              {hasTest && testFree && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm animate-pulse">🧪 Test gratuit</span>
              )}
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">🎓 Certifiante</span>
            </div>

            {/* Description courte */}
            <p className="text-gray-700 text-lg mb-6">{description}</p>

            {/* Informations clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                <p className="text-sm text-gray-600">📚 Niveaux</p>
                <p className="text-xl font-bold text-blue-700">A1 • A2 • B1</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                <p className="text-sm text-gray-600">⏱️ Durée</p>
                <p className="text-xl font-bold text-green-700">{duration}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
                <p className="text-sm text-gray-600">🎓 Certification</p>
                <p className="text-xl font-bold text-purple-700">Goethe • ÖSD</p>
              </div>
            </div>

            {/* Description complète */}
            {fullDescription && (
              <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">📖 Description détaillée</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{fullDescription}</div>
              </div>
            )}

            {/* Programme */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Programme de la formation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#1a56db] mb-2">Niveau A1 - Débutant</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>✅ Alphabet et prononciation</li>
                  <li>✅ Se présenter et poser des questions simples</li>
                  <li>✅ Vocabulaire de base (famille, travail, loisirs)</li>
                  <li>✅ Grammaire : articles, verbes au présent</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#76c21f] mb-2">Niveau A2 - Élémentaire</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>✅ Communication dans des situations quotidiennes</li>
                  <li>✅ Expression du passé (perfekt, präteritum)</li>
                  <li>✅ Vocabulaire élargi (voyages, santé, médias)</li>
                  <li>✅ Compréhension de textes simples</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="font-bold text-[#f59e0b] mb-2">Niveau B1 - Intermédiaire</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-gray-600 text-sm">
                  <li>✅ Expression orale et écrite</li>
                  <li>✅ Compréhension de textes complexes</li>
                  <li>✅ Grammaire avancée (subjonctif, passif)</li>
                  <li>✅ Préparation aux examens Goethe et ÖSD</li>
                </ul>
              </div>
            </div>

            {/* Tarif */}
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200 mb-6">
              <p className="text-sm text-gray-600">💰 Tarif</p>
              <p className="text-2xl font-bold text-gray-800">{price}</p>
            </div>

            {/* Informations pratiques */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">📋 Informations pratiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 text-sm">
                <p>📅 Démarrage : Prochaine session bientôt</p>
                <p>💻 Modalité : Présentiel ou à distance</p>
                <p>📞 Contact : 54 582 980 | 54 582 982</p>
                <p>🏠 Avenue du combattant suprême, 5000 Monastir</p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/inscription" 
                className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                📝 S'inscrire
              </Link>
              <Link 
                to="/contact" 
                className="border-2 border-[#1a56db] text-[#1a56db] px-8 py-3 rounded-lg font-semibold hover:bg-[#1a56db] hover:text-white transition-all"
              >
                📩 Demander un devis
              </Link>
              {hasTest && (
                <Link 
                  to="/test/allemand-goethe-osd-monastir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>🧪</span> Faire le test gratuit
                </Link>
              )}
            </div>

            {/* Retour aux formations */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Link to="/formations" className="text-[#1a56db] hover:underline">
                ← Retour à toutes les formations
              </Link>
              <p className="text-xs text-gray-400 mt-2">
                {formationData ? (
                  <span className="text-green-600">✓ Données synchronisées depuis Supabase</span>
                ) : (
                  <span className="text-orange-500">⚠ Données par défaut</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}