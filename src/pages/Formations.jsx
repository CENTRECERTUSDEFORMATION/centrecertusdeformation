import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function Formations() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchFormations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Erreur chargement formations");
      } else {
        setFormations(data || []);
        setFilteredFormations(data || []);
      }

      setLoading(false);
    };

    fetchFormations();
  }, []);

  // Fonction de recherche
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredFormations(formations);
    } else {
      const filtered = formations.filter((formation) =>
        formation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFormations(filtered);
    }
  }, [searchTerm, formations]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur génération URL:", error);
      return null;
    }
  };

  const handleDelete = async (id, imagesPaths) => {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer cette formation ?")) return;

    if (imagesPaths && imagesPaths.length > 0) {
      await supabase.storage.from("uploads").remove(imagesPaths);
    }

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id);

    if (!error) {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <p className="mt-20 text-center">Chargement...</p>;

  return (
    <div className="p-6 mt-20">
      <div className="flex flex-col lg:flex-row gap-6 max-w-full">
        
        {/* COLONNE GAUCHE - LISTE DES TITRES */}
        <div className="lg:w-1/4 xl:w-1/5">
          <div className="bg-white rounded-xl shadow-lg sticky top-24">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-t-xl">
              <h3 className="font-semibold">📚 Formations</h3>
              <p className="text-sm opacity-90">{filteredFormations.length} formation(s)</p>
            </div>
            
            {/* Barre de recherche */}
            <div className="p-3 border-b">
              <input
                type="text"
                placeholder="🔍 Rechercher..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Liste des titres */}
            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {filteredFormations.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">Aucune formation trouvée</p>
              ) : (
                filteredFormations.map((formation, index) => (
                  <motion.div
                    key={formation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-3 cursor-pointer hover:bg-blue-50 transition-all border-l-4 border-transparent hover:border-blue-500"
                    onClick={() => {
                      const element = document.getElementById(`formation-${formation.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                  >
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {formation.title}
                    </h4>
                    {formation.onDemand && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        À la demande
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE - GRILLE DES FORMATIONS */}
        <div className="lg:w-3/4 xl:w-4/5">
          {/* En-tête avec bouton ajout */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Toutes nos formations
            </h2>
            
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg"
                onClick={() => navigate("/ajouter-formation")}
              >
                ➕ Ajouter une formation
              </motion.button>
            )}
          </div>

          {/* Résultat de recherche */}
          <p className="text-sm text-gray-500 mb-4">
            {filteredFormations.length} formation(s) trouvée(s)
          </p>

          {/* Grille des formations */}
          {filteredFormations.length === 0 ? (
            <p className="text-gray-500 text-center py-20">Aucune formation trouvée</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredFormations.map((formation, index) => (
                  <motion.div
                    id={`formation-${formation.id}`}
                    key={formation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
                    onClick={() => navigate(`/formations/${formation.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {formation.images && formation.images.length > 0 ? (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          src={getImageUrl(formation.images[0])}
                          alt={formation.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/400x300?text=📚+Formation";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          📚
                        </div>
                      )}
                      
                      {/* Badge "À la demande" */}
                      {formation.onDemand && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
                            À la demande
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800">
                        {formation.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {formation.description || "Cliquez pour voir la description complète"}
                      </p>
                      
                      {/* Indicateur de clic */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-blue-500">Voir détails</span>
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Boutons admin */}
                    {isAdmin && (
                      <div className="flex gap-2 p-3 pt-0 border-t mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/modifier-formation/${formation.id}`);
                          }}
                          className="flex-1 text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(formation.id, formation.images);
                          }}
                          className="flex-1 text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}