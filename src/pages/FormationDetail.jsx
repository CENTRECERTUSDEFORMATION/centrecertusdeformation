import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

// Configuration des 7 thèmes avec couleurs
const THEME_CONFIG = {
  digital: { name: "Digital & Web", icon: "💻", color: "bg-blue-100 text-blue-700" },
  data: { name: "Data & IA", icon: "📊", color: "bg-purple-100 text-purple-700" },
  design: { name: "Design & Créativité", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  management: { name: "Management & Leadership", icon: "📈", color: "bg-green-100 text-green-700" },
  finance: { name: "Finance & Comptabilité", icon: "💰", color: "bg-yellow-100 text-yellow-700" },
  energie: { name: "Énergies renouvelables", icon: "🌱", color: "bg-teal-100 text-teal-700" },
  langues: { name: "Langues & Communication", icon: "🗣️", color: "bg-indigo-100 text-indigo-700" }
};

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setFormation(data || null);
      } catch (err) {
        console.error("Erreur fetch:", err);
        setFormation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20">
        <p className="text-red-600">Formation introuvable</p>
        <button onClick={() => navigate("/formations")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Retour aux formations</button>
      </motion.div>
    );
  }

  const themeConfig = THEME_CONFIG[formation.theme] || THEME_CONFIG.digital;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto px-4 py-8 mt-20">
      <motion.button whileHover={{ x: -5 }} onClick={() => navigate("/formations")} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
        ← Retour à la liste des formations
      </motion.button>

      {/* Badges */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${themeConfig.color}`}>
          <span>{themeConfig.icon}</span> {themeConfig.name}
        </span>
        {formation.is_online && <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">🌍 Formation à distance</span>}
        {formation.onDemand && <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">🎯 À la demande</span>}
        <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">🎓 Certifiante</span>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">{formation.title}</h1>

      {/* Durée et Prix */}
      {(formation.duration || formation.price) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {formation.duration && <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200"><p className="text-xs text-gray-500 uppercase tracking-wide">Durée</p><p className="text-xl font-semibold text-gray-800">{formation.duration}</p></div>}
          {formation.price && <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200"><p className="text-xs text-gray-500 uppercase tracking-wide">Tarif</p><p className="text-xl font-semibold text-gray-800">{formation.price}</p></div>}
        </div>
      )}

      {/* Images */}
      {formation.images && formation.images.length > 0 ? (
        <div className="mb-8">
          <div className="relative h-96 rounded-xl overflow-hidden shadow-xl mb-4 bg-gray-100">
            <img src={getImageUrl(formation.images[selectedImage])} alt={formation.title} className="w-full h-full object-contain" onError={(e) => e.target.src = "https://placehold.co/800x400?text=Image+non+disponible"} />
          </div>
          {formation.images.length > 1 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {formation.images.map((img, idx) => (
                <motion.img key={idx} whileHover={{ scale: 1.05 }} src={getImageUrl(img)} alt={`Miniature ${idx + 1}`} className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${selectedImage === idx ? "ring-2 ring-blue-500 shadow-lg" : "opacity-70 hover:opacity-100"}`} onClick={() => setSelectedImage(idx)} onError={(e) => e.target.style.display = "none"} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-2">📚</div><p className="text-gray-500">Aucune image disponible</p></div></div>
      )}

      {formation.description && <div className="mb-6"><h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2><p className="text-gray-600 leading-relaxed">{formation.description}</p></div>}
      {formation.fullDescription && <div className="mb-8 bg-gray-50 p-6 rounded-xl"><h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2><div className="text-gray-600 leading-relaxed whitespace-pre-line">{formation.fullDescription}</div></div>}
      {formation.preinscriptionLink && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={formation.preinscriptionLink} target="_blank" rel="noreferrer" className="inline-block bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all">📝 S'inscrire à cette formation</motion.a>
        </motion.div>
      )}
    </motion.div>
  );
}