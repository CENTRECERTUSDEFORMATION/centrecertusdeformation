import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Couleurs pour le texte sélectionné
const TEXT_COLORS = [
  { name: "Bleu", hex: "#1a56db" },
  { name: "Vert", hex: "#76c21f" },
  { name: "Orange", hex: "#f59e0b" },
  { name: "Rouge", hex: "#dc2626" }
];

// Couleurs de fond pour l'actualité
const BACKGROUND_COLORS = [
  { name: "Blanc", hex: "#ffffff", class: "bg-white" },
  { name: "Bleu clair", hex: "#dbeafe", class: "bg-blue-50" },
  { name: "Vert clair", hex: "#d1fae5", class: "bg-green-50" },
  { name: "Orange clair", hex: "#fef3c7", class: "bg-orange-50" },
  { name: "Rouge clair (Alerte)", hex: "#fee2e2", class: "bg-red-50" }
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

  // Fonction pour appliquer la couleur à une partie du texte sélectionné
  const applyColorToSelection = async (id, colorHex) => {
    // Récupérer le texte sélectionné
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (!selectedText) {
      toast.info("Sélectionnez d'abord le texte à colorer");
      return;
    }

    try {
      // Récupérer l'actualité actuelle
      const { data: actualite, error: fetchError } = await supabase
        .from("actualites")
        .select("contenu")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      let contenu = actualite.contenu || "";
      
      // Remplacer le texte sélectionné par du texte coloré (avec span)
      const styledText = `<span style="color: ${colorHex}; font-weight: bold;">${selectedText}</span>`;
      const newContenu = contenu.replace(selectedText, styledText);

      // Mettre à jour la base
      const { error: updateError } = await supabase
        .from("actualites")
        .update({ contenu: newContenu })
        .eq("id", id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setActualites(prev => prev.map(a => 
        a.id === id ? { ...a, contenu: newContenu } : a
      ));
      setFilteredActualites(prev => prev.map(a => 
        a.id === id ? { ...a, contenu: newContenu } : a
      ));
      
      toast.success(`Couleur ${colorHex} appliquée au texte sélectionné !`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'application de la couleur");
    }
  };

  // Fonction pour appliquer un fond à l'actualité
  const applyBackgroundColor = async (id, bgColorHex) => {
    try {
      const { error: updateError } = await supabase
        .from("actualites")
        .update({ background_color: bgColorHex })
        .eq("id", id);

      if (updateError) throw updateError;

      setActualites(prev => prev.map(a => 
        a.id === id ? { ...a, background_color: bgColorHex } : a
      ));
      setFilteredActualites(prev => prev.map(a => 
        a.id === id ? { ...a, background_color: bgColorHex } : a
      ));
      
      toast.success("Couleur de fond appliquée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'application du fond");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-10 h-10 border-3 border-[#76c21f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Actualités</h1>
              <p className="text-gray-500 text-sm">Toute l'actualité de CERTUS</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="border border-gray-300 rounded-lg px-4 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {isAdmin && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  onClick={() => navigate("/ajouter-actualite")}
                >
                  + Nouvelle actualité
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredActualites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {filteredActualites.map((a, index) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
                  style={{ backgroundColor: a.background_color || "#ffffff" }}
                >
                  <div className="p-6 md:p-8">
                    {/* Métadonnées et boutons admin */}
                    <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Date inconnue'}
                      </div>
                      
                      {/* Boutons admin */}
                      {isAdmin && (
                        <div className="flex gap-3 items-center flex-wrap">
                          {/* Couleurs de texte */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">🎨 Texte:</span>
                            {TEXT_COLORS.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => applyColorToSelection(a.id, color.hex)}
                                className="w-6 h-6 rounded-full transition-transform hover:scale-110 shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                title={`Appliquer ${color.name} au texte sélectionné`}
                              />
                            ))}
                          </div>
                          
                          {/* Couleurs de fond */}
                          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                            <span className="text-xs text-gray-400">🎨 Fond:</span>
                            {BACKGROUND_COLORS.map((color) => (
                              <button
                                key={color.hex}
                                onClick={() => applyBackgroundColor(a.id, color.hex)}
                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 shadow-sm ${color.class}`}
                                style={{ backgroundColor: color.hex }}
                                title={`Fond ${color.name}`}
                              />
                            ))}
                          </div>
                          
                          <button
                            onClick={() => navigate(`/modifier-actualite/${a.id}`)}
                            className="text-gray-500 hover:text-yellow-600 text-sm px-2 py-1"
                            title="Modifier"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.images)}
                            className="text-gray-500 hover:text-red-600 text-sm px-2 py-1"
                            title="Supprimer"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Layout: Image à droite, texte à gauche */}
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Texte à gauche */}
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                          {a.titre}
                        </h2>
                        
                        <div className="prose prose-lg max-w-none">
                          <div 
                            className="leading-relaxed text-gray-600"
                            dangerouslySetInnerHTML={{ 
                              __html: a.contenu ? a.contenu.replace(/\n/g, '<br/>') : "Aucun contenu"
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Image à droite */}
                      {a.images && a.images.length > 0 && (
                        <div className="md:w-2/5 lg:w-1/3">
                          <div className="rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all">
                            <img
                              src={getImageUrl(a.images[0])}
                              alt={a.titre}
                              className="w-full h-auto"
                              style={{ display: 'block' }}
                              onClick={() => setSelectedImage({ images: a.images, index: 0 })}
                            />
                            {a.images.length > 1 && (
                              <div className="flex justify-between items-center mt-2 px-2 pb-2">
                                <div className="flex gap-1">
                                  {a.images.slice(1, 4).map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={getImageUrl(img)}
                                      alt={`Miniature ${idx + 2}`}
                                      className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                      onClick={() => setSelectedImage({ images: a.images, index: idx + 1 })}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {a.images.length} photo(s)
                                </span>
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

      {/* Modal galerie */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageUrl(selectedImage.images[selectedImage.index])}
                alt="Agrandissement"
                className="w-full rounded-lg shadow-2xl"
                style={{ maxHeight: "85vh", objectFit: "contain" }}
              />
              
              {selectedImage.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage({
                      ...selectedImage,
                      index: (selectedImage.index - 1 + selectedImage.images.length) % selectedImage.images.length
                    })}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setSelectedImage({
                      ...selectedImage,
                      index: (selectedImage.index + 1) % selectedImage.images.length
                    })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition"
                  >
                    ▶
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {selectedImage.index + 1} / {selectedImage.images.length}
              </div>
              
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition text-xl"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}