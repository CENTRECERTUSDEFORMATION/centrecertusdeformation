import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formations, setFormations] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [accessCodes, setAccessCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("formations");

  // Charger les données
  const fetchData = async () => {
    setLoading(true);

    // Charger formations
    const { data: formationsData, error: formationsError } = await supabase
      .from("formations")
      .select("*")
      .order("created_at", { ascending: false });

    if (formationsError) {
      console.error(formationsError);
      toast.error("Erreur chargement formations");
    } else {
      setFormations(formationsData || []);
      
      // Charger les codes d'accès pour chaque formation
      if (formationsData && formationsData.length > 0) {
        const { data: codesData } = await supabase
          .from("formation_access_codes")
          .select("*")
          .in("formation_id", formationsData.map(f => f.id));
        
        if (codesData) {
          const codesMap = {};
          codesData.forEach(code => {
            codesMap[code.formation_id] = code;
          });
          setAccessCodes(codesMap);
        }
      }
    }

    // Charger actualites
    const { data: actualitesData, error: actualitesError } = await supabase
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    if (actualitesError) {
      console.error(actualitesError);
      toast.error("Erreur chargement actualités");
    } else {
      setActualites(actualitesData || []);
    }

    setLoading(false);
  };

  // Générer un code aléatoire
  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Générer les codes pour une formation
  const generateCodesForFormation = async (formationId) => {
    setGenerating(true);
    
    const teacherCode = generateRandomCode();
    const participantCode = generateRandomCode();
    
    try {
      // Vérifier si des codes existent déjà
      const { data: existing } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", formationId)
        .single();
      
      let error;
      
      if (existing) {
        // Mettre à jour
        const { error: updateError } = await supabase
          .from("formation_access_codes")
          .update({
            teacher_code: teacherCode,
            participant_code: participantCode,
            updated_at: new Date().toISOString()
          })
          .eq("formation_id", formationId);
        error = updateError;
      } else {
        // Créer
        const { error: insertError } = await supabase
          .from("formation_access_codes")
          .insert({
            formation_id: formationId,
            teacher_code: teacherCode,
            participant_code: participantCode,
            is_active: true
          });
        error = insertError;
      }
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setAccessCodes(prev => ({
        ...prev,
        [formationId]: { teacher_code: teacherCode, participant_code: participantCode }
      }));
      
      toast.success("Codes générés avec succès !");
      setShowCodeModal({ formationId, teacherCode, participantCode });
      
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération des codes");
    } finally {
      setGenerating(false);
    }
  };

  // Supprimer une formation
  const deleteFormation = async (id) => {
    if (!window.confirm("Supprimer cette formation ?")) return;

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    }
  };

  // Supprimer une actualité
  const deleteActualite = async (id) => {
    if (!window.confirm("Supprimer cette actualité ?")) return;

    const { error } = await supabase
      .from("actualites")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Actualité supprimée");
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié !");
  };

  // Vérification admin
  useEffect(() => {
    if (!user) {
      navigate("/connexion");
      return;
    }

    if (!isAdmin) {
      navigate("/espace-participant");
      return;
    }

    fetchData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;
  if (loading) return (
    <div className="flex justify-center items-center h-96 mt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white rounded-2xl overflow-hidden mb-8">
            <div className="p-8">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span>⚙️</span> Tableau de bord administrateur
              </h1>
              <p className="text-blue-100 mt-1">
                Gérez les formations, les actualités et les codes d'accès
              </p>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("formations")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "formations"
                  ? "text-[#1a56db] border-b-2 border-[#1a56db]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Formations
            </button>
            <button
              onClick={() => setActiveTab("actualites")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "actualites"
                  ? "text-[#1a56db] border-b-2 border-[#1a56db]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📰 Actualités
            </button>
          </div>

          {/* Contenu Formations */}
          {activeTab === "formations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Formations</h2>
                <button
                  onClick={() => navigate("/ajouter-formation")}
                  className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <span>➕</span> Ajouter une formation
                </button>
              </div>

              {formations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500">Aucune formation</p>
                  <button
                    onClick={() => navigate("/ajouter-formation")}
                    className="mt-4 text-[#1a56db] hover:underline"
                  >
                    Créer la première formation
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {formations.map((formation) => (
                    <motion.div
                      key={formation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">
                              {formation.title}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                              {formation.description || "Aucune description"}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {formation.duration && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  📅 {formation.duration}
                                </span>
                              )}
                              {formation.is_online && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  🌍 À distance
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => navigate(`/modifier-formation/${formation.id}`)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteFormation(formation.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Section Codes d'accès */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">
                              🔑 Codes d'accès
                            </div>
                            <button
                              onClick={() => generateCodesForFormation(formation.id)}
                              disabled={generating}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition disabled:opacity-50"
                            >
                              {accessCodes[formation.id] ? "🔄 Régénérer" : "🎲 Générer"}
                            </button>
                          </div>
                          
                          {accessCodes[formation.id] ? (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="bg-blue-50 rounded-lg p-2">
                                <div className="text-xs text-blue-600 mb-1">👨‍🏫 Code Formateur</div>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono font-bold bg-white px-2 py-1 rounded border">
                                    {accessCodes[formation.id].teacher_code}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(accessCodes[formation.id].teacher_code)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    📋
                                  </button>
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2">
                                <div className="text-xs text-green-600 mb-1">👨‍🎓 Code Participant</div>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono font-bold bg-white px-2 py-1 rounded border">
                                    {accessCodes[formation.id].participant_code}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(accessCodes[formation.id].participant_code)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    📋
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-2">
                              Aucun code généré. Cliquez sur "Générer" pour créer des codes d'accès.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenu Actualités */}
          {activeTab === "actualites" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Actualités</h2>
                <button
                  onClick={() => navigate("/ajouter-actualite")}
                  className="bg-[#1a56db] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <span>➕</span> Ajouter une actualité
                </button>
              </div>

              {actualites.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📰</div>
                  <p className="text-gray-500">Aucune actualité</p>
                  <button
                    onClick={() => navigate("/ajouter-actualite")}
                    className="mt-4 text-[#1a56db] hover:underline"
                  >
                    Créer la première actualité
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {actualites.map((actualite) => (
                    <motion.div
                      key={actualite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-md p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {actualite.titre}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {actualite.contenu?.substring(0, 150)}...
                          </p>
                          {actualite.created_at && (
                            <p className="text-xs text-gray-400 mt-2">
                              📅 {new Date(actualite.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => navigate(`/modifier-actualite/${actualite.id}`)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteActualite(actualite.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'affichage des codes générés */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">✅ Codes générés</h3>
                  <button
                    onClick={() => setShowCodeModal(null)}
                    className="text-white/80 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Partagez ces codes avec les utilisateurs :
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-700 mb-1">👨‍🏫 Code Formateur</div>
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono font-bold bg-white px-3 py-1 rounded border">
                        {showCodeModal.teacherCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(showCodeModal.teacherCode)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-700 mb-1">👨‍🎓 Code Participant</div>
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono font-bold bg-white px-3 py-1 rounded border">
                        {showCodeModal.participantCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(showCodeModal.participantCode)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCodeModal(null)}
                  className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TableauDeBordAdmin;