// frontend/src/pages/formations/langues/FormationItalienMonastir.jsx
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { searchInFormations } from "../../../utils/stringUtils";

export default function FormationItalienMonastir() {
  const [imageUrl, setImageUrl] = useState(null);
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);

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

        const found = searchInFormations(data, "italien");

        if (found) {
          setFormationData(found);
          if (found?.images?.length > 0) {
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(found.images[0]);
            setImageUrl(urlData.publicUrl);
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

  const title = formationData?.title || "Formation Italien à Monastir";
  const description = formationData?.description || "Formation Italien certifiante à Monastir. Cours A1 à B2, préparation CELI/PLIDA.";
  const duration = formationData?.duration || "60h à 120h";
  const price = formationData?.price || "Sur devis";
  const fullDescription = formationData?.fullDescription || null;

  return (
    <>
      <Helmet>
        <title>{title} | Centre Certus Monastir</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://centrecertusdeformation.tn/formation-italien-monastir" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://centrecertusdeformation.tn/formation-italien-monastir" />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">🇮🇹</span>
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          </div>
          
          {/* ✅ IMAGE EN MODE "CONTAIN" POUR LES AFFICHES TEXTE */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-md bg-gray-100">
            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-pulse flex items-center justify-center w-full h-full">
                  <span className="text-gray-400">Chargement...</span>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="w-full h-64 flex items-center justify-center bg-gray-50">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-contain hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-6xl opacity-30">🇮🇹</span>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Niveaux</p>
              <p className="text-xl font-bold text-blue-700">A1 • A2 • B1 • B2</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Durée</p>
              <p className="text-xl font-bold text-green-700">{duration}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600">Certification</p>
              <p className="text-xl font-bold text-purple-700">CELI • PLIDA</p>
            </div>
          </div>

          {fullDescription && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{fullDescription}</div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Programme de la formation</h2>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li>✅ Maîtrise de l'italien conversationnel et professionnel</li>
            <li>✅ Grammaire et conjugaison italienne</li>
            <li>✅ Culture et civilisation italiennes</li>
            <li>✅ Préparation aux examens CELI et PLIDA</li>
            <li>✅ Cours d'italien général et d'italien des affaires</li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200 mb-6">
            <p className="text-sm text-gray-600">Tarif</p>
            <p className="text-2xl font-bold text-gray-800">{price}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">📍 Informations pratiques</h3>
            <p>📅 Démarrage : Prochaine session bientôt</p>
            <p>💻 Modalité : Présentiel ou à distance</p>
            <p>📞 Contact : 54 582 980 | 54 582 982</p>
            <p>🏠 Avenue du combattant suprême, 5000 Monastir</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              📩 Demander un devis
            </Link>
            <Link to="/inscription" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
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