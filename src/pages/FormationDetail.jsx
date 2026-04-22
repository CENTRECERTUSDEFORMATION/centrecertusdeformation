import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        console.log("Récupération formation ID:", id);
        
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erreur Supabase:", error);
          throw error;
        }
        
        console.log("Formation récupérée:", data);
        console.log("Images:", data?.images);
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
    if (!path) {
      console.log("Pas de chemin d'image");
      return null;
    }
    
    console.log("Chemin image:", path);
    
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      console.log("URL générée:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur génération URL:", error);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-20"
      >
        <p className="text-red-600">Formation introuvable</p>
        <button
          onClick={() => navigate("/formations")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retour aux formations
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-8 mt-20"
    >
      {/* Bouton retour */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate("/formations")}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
      >
        ← Retour à la liste des formations
      </motion.button>

      {/* Titre */}
      <h1 className="text-4xl font-bold mb-6 text-blue-800 text-center">
        {formation.title}
      </h1>

      {/* Images */}
      {formation.images && formation.images.length > 0 ? (
        <div className="mb-8">
          {/* Image principale */}
          <div className="relative h-96 rounded-xl overflow-hidden shadow-xl mb-4 bg-gray-100">
            <img
              src={getImageUrl(formation.images[selectedImage])}
              alt={formation.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Erreur chargement image:", formation.images[selectedImage]);
                e.target.src = "https://placehold.co/800x400?text=Image+non+disponible";
              }}
            />
          </div>
          
          {/* Miniatures */}
          {formation.images.length > 1 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {formation.images.map((img, idx) => (
                <motion.img
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  src={getImageUrl(img)}
                  alt={`Miniature ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                    selectedImage === idx
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImage(idx)}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">📚</div>
            <p className="text-gray-500">Aucune image disponible</p>
          </div>
        </div>
      )}

      {/* Description courte */}
      {formation.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600 leading-relaxed">{formation.description}</p>
        </div>
      )}

      {/* Description complète */}
      {formation.fullDescription && (
        <div className="mb-8 bg-gray-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line">
            {formation.fullDescription}
          </div>
        </div>
      )}

      {/* Badge "À la demande" */}
      {formation.onDemand && (
        <div className="text-center mb-6">
          <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
            📅 Formation à la demande
          </span>
        </div>
      )}

      {/* Bouton d'inscription */}
      {formation.preinscriptionLink && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={formation.preinscriptionLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all"
          >
            📝 S'inscrire à cette formation
          </motion.a>
        </motion.div>
      )}
    </motion.div>
  );
}