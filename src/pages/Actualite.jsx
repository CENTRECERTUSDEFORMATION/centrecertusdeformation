import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function Actualite() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredActualites, setFilteredActualites] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedActualite, setSelectedActualite] = useState(null);

  useEffect(() => {
    const fetchActualites = async () => {
      setLoading(true);

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

      setLoading(false);
    };

    fetchActualites();
  }, []);

  // Recherche
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
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDelete = async (id, imagesPaths) => {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer cette actualité ?")) return;

    if (imagesPaths && imagesPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .remove(imagesPaths);
      
      if (storageError) {
        console.error("Erreur suppression images:", storageError);
      }
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

  // Rendu des images superposées (style empilement)
  const renderStackedImages = (images) => {
    if (!images || images.length === 0) return null;
    
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;
    
    return (
      <div className="relative h-48 w-full">
        {displayImages.map((img, idx) => {
          // Calcul des rotations et décalages pour effet polaroid
          const rotations = [-6, -3, 3, 6];
          const offsets = [8, 4, -4, -8];
          const zIndex = idx;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: rotations[idx] || 0,
                x: offsets[idx] || 0,
                y: -Math.abs(offsets[idx]) / 2
              }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ 
                scale: 1.05, 
                rotate: 0, 
                x: 0, 
                y: -10,
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
              style={{ 
                position: 'absolute',
                left: `${idx * 12}px`,
                top: `${idx * 8}px`,
                zIndex: zIndex,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              className="bg-white p-2 rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedActualite(null);
                setSelectedImage({ images, index: idx });
              }}
            >
              <img
                src={getImageUrl(img)}
                alt={`Image ${idx + 1}`}
                className="w-40 h-32 object-cover rounded"
              />
            </motion.div>
          );
        })}
        
        {/* Indicateur d'images supplémentaires */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              position: 'absolute',
              left: `${displayImages.length * 12}px`,
              top: `${displayImages.length * 8}px`,
              zIndex: displayImages.length
            }}
            className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 mt-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 mt-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 flex-wrap gap-4"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Actualités
          </h2>
          
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg"
              onClick={() => navigate("/ajouter-actualite")}
            >
              ➕ Ajouter une actualité
            </motion.button>
          )}
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="🔍 Rechercher une actualité..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Grille des actualités */}
        {filteredActualites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📭
            </motion.div>
            <p className="text-gray-500">Aucune actualité trouvée</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredActualites.map((a, index) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Images superposées */}
                  {a.images && a.images.length > 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                      {renderStackedImages(a.images)}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-4">
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      className="font-bold text-xl mb-2 line-clamp-2 text-gray-800"
                    >
                      {a.titre}
                    </motion.h3>
                    
                    {a.contenu && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="text-gray-600 text-sm line-clamp-3 mb-3"
                      >
                        {a.contenu}
                      </motion.p>
                    )}
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="flex justify-between items-center"
                    >
                      <p className="text-xs text-gray-400">
                        {a.created_at 
                          ? new Date(a.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : "Date non disponible"}
                      </p>
                      
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
                          onClick={() => handleDelete(a.id, a.images)}
                        >
                          🗑️ Supprimer
                        </motion.button>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal pour afficher l'image en grand */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(selectedImage.images[selectedImage.index])}
              alt="Agrandissement"
              className="w-full rounded-lg shadow-2xl"
            />
            
            {/* Navigation entre images */}
            {selectedImage.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                <button
                  onClick={() => setSelectedImage({
                    ...selectedImage,
                    index: (selectedImage.index - 1 + selectedImage.images.length) % selectedImage.images.length
                  })}
                  className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
                >
                  ◀
                </button>
                <button
                  onClick={() => setSelectedImage({
                    ...selectedImage,
                    index: (selectedImage.index + 1) % selectedImage.images.length
                  })}
                  className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
                >
                  ▶
                </button>
              </div>
            )}
            
            {/* Indicateur */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage.index + 1} / {selectedImage.images.length}
            </div>
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}