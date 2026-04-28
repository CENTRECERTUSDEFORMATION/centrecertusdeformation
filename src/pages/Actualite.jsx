import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Couleurs officielles CERTUS
const CERTUS_COLORS = [
  { name: "Bleu Certus", hex: "#1a56db" },
  { name: "Vert Certus", hex: "#76c21f" },
  { name: "Orange Certus", hex: "#f59e0b" },
  { name: "Noir Certus", hex: "#374151" }
];

export default function Actualite() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredActualites, setFilteredActualites] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchActualites = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("actualites")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          toast.error("Erreur chargement actualités");
        } else {
          setActualites(data || []);
          setFilteredActualites(data || []);
        }
      } catch (err) {
        console.error("Erreur réseau:", err);
        toast.error("Problème de connexion à Supabase");
      } finally {
        setLoading(false);
      }
    };

    fetchActualites();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredActualites(actualites);
    } else {
      const filtered = actualites.filter((a) =>
        a.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contenu?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActualites(filtered);
    }
  }, [searchTerm, actualites]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      return null;
    }
  };

  const handleDelete = async (id, imagesPaths) => {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer cette actualité ?")) return;

    if (imagesPaths && imagesPaths.length > 0) {
      await supabase.storage.from("uploads").remove(imagesPaths);
    }

    const { error } = await supabase
      .from("actualites")
      .delete()
      .eq("id", id);

    if (!error) {
      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Actualité supprimée");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const applyTextColor = async (id, colorHex) => {
    try {
      const { error } = await supabase
        .from("actualites")
        .update({ text_color: colorHex })
        .eq("id", id);

      if (error) {
        console.error("Erreur Supabase:", error);
        toast.error("Erreur lors de l'application");
        return;
      }

      setActualites(prev => prev.map(a => 
        a.id === id ? { ...a, text_color: colorHex } : a
      ));
      
      setFilteredActualites(prev => prev.map(a => 
        a.id === id ? { ...a, text_color: colorHex } : a
      ));
      
      toast.success("Couleur appliquée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-10 h-10 border-3 border-[#76c21f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#eff6ff] pt-20">
      {/* Header - Bleu Certus */}
      <div className="bg-[#1a56db] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Actualités CERTUS</h1>
              <p className="text-blue-100 text-sm mt-1">Devenez ce que vous avez choisi avec CERTUS</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 pl-9 text-sm text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {isAdmin && (
                <button
                  className="bg-[#76c21f] text-white px-4 py-2 rounded-lg hover:bg-[#5fa018] transition text-sm font-medium flex items-center gap-1"
                  onClick={() => navigate("/ajouter-actualite")}
                >
                  <span className="text-lg">+</span> Nouvelle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredActualites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {filteredActualites.map((a, index) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* En-tête avec date et boutons admin */}
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Date inconnue'}
                      </div>
                      
                      {/* Boutons admin - 4 boutons de couleur en ligne */}
                      {isAdmin && (
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-gray-400 mr-1">Couleur:</span>
                          {CERTUS_COLORS.map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => applyTextColor(a.id, color.hex)}
                              className="w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm border border-white"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                          <button
                            onClick={() => handleDelete(a.id, a.images)}
                            className="ml-2 text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg border border-gray-200 bg-white"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Titre avec couleur */}
                    <h2 
                      className="text-xl font-bold mb-3"
                      style={{ color: a.text_color || "#374151" }}
                    >
                      {a.titre}
                    </h2>
                    
                    {/* Contenu avec couleur */}
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className={`flex-1 ${a.images && a.images.length > 0 ? 'md:w-2/3' : 'w-full'}`}>
                        <p 
                          className="leading-relaxed whitespace-pre-line"
                          style={{ color: a.text_color || "#374151" }}
                        >
                          {a.contenu || "Aucun contenu"}
                        </p>
                      </div>
                      
                      {/* Images */}
                      {a.images && a.images.length > 0 && (
                        <div className="md:w-1/3">
                          <div className="flex gap-2 flex-wrap">
                            {a.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={getImageUrl(img)}
                                alt={`Illustration ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border-2 border-[#1a56db]/20"
                                onClick={() => setSelectedImage({ images: a.images, index: idx })}
                              />
                            ))}
                            {a.images.length > 3 && (
                              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                +{a.images.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal image */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl p-2">
                <img
                  src={getImageUrl(selectedImage.images[selectedImage.index])}
                  alt="Agrandissement"
                  className="w-full rounded-lg"
                />
                
                {selectedImage.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage({
                        ...selectedImage,
                        index: (selectedImage.index - 1 + selectedImage.images.length) % selectedImage.images.length
                      })}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setSelectedImage({
                        ...selectedImage,
                        index: (selectedImage.index + 1) % selectedImage.images.length
                      })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
                    >
                      ▶
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage.index + 1} / {selectedImage.images.length}
                </div>
                
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}