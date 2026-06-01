import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formations, setFormations] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [accessCodes, setAccessCodes] = useState({});
  const [inscriptionsByFormation, setInscriptionsByFormation] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("formations");
  const [expandedFormation, setExpandedFormation] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Formations
      const { data: formationsData } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });
      setFormations(formationsData || []);
      console.log("Formations chargées:", formationsData?.length);

      // Codes d'accès
      if (formationsData?.length > 0) {
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

      // Récupérer toutes les demandes "À la demande"
      const { data: demandesData } = await supabase
        .from("demandes_presentiel")
        .select("*")
        .order("created_at", { ascending: false });

      // Organiser les demandes par formation
      const inscriptionsMap = {};
      if (demandesData) {
        demandesData.forEach(demande => {
          if (!inscriptionsMap[demande.formation_id]) {
            inscriptionsMap[demande.formation_id] = [];
          }
          inscriptionsMap[demande.formation_id].push(demande);
        });
      }
      setInscriptionsByFormation(inscriptionsMap);

      // Actualités
      const { data: actualitesData } = await supabase
        .from("actualites")
        .select("*")
        .order("created_at", { ascending: false });
      setActualites(actualitesData || []);
      console.log("Actualités chargées:", actualitesData?.length);

    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (formationId) => {
    setGenerating(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const { data: existing } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", formationId)
        .maybeSingle();
      
      if (existing) {
        await supabase
          .from("formation_access_codes")
          .update({ teacher_code: newCode, participant_code: newCode, access_code: newCode })
          .eq("formation_id", formationId);
      } else {
        await supabase
          .from("formation_access_codes")
          .insert({ formation_id: formationId, teacher_code: newCode, participant_code: newCode, access_code: newCode });
      }
      
      setAccessCodes(prev => ({ ...prev, [formationId]: { access_code: newCode } }));
      toast.success(`✅ Code: ${newCode}`);
      navigator.clipboard.writeText(newCode);
      
    } catch (error) {
      toast.error("Erreur");
    } finally {
      setGenerating(false);
    }
  };

  const deleteFormation = async (id) => {
    if (!confirm("Supprimer cette formation ?")) return;
    await supabase.from("formations").delete().eq("id", id);
    setFormations(prev => prev.filter(f => f.id !== id));
    toast.success("Formation supprimée");
  };

  const deleteActualite = async (id) => {
    if (!confirm("Supprimer cette actualité ?")) return;
    await supabase.from("actualites").delete().eq("id", id);
    setActualites(prev => prev.filter(a => a.id !== id));
    toast.success("Actualité supprimée");
  };

  const marquerContacte = async (demandeId) => {
    try {
      const { error } = await supabase
        .from("demandes_presentiel")
        .update({ statut: "contacte", contacte_le: new Date().toISOString() })
        .eq("id", demandeId);
      
      if (error) throw error;
      
      toast.success("✅ Demandeur marqué comme contacté");
      fetchData(); // Recharger les données
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleFormationExpand = (formationId) => {
    if (expandedFormation === formationId) {
      setExpandedFormation(null);
    } else {
      setExpandedFormation(formationId);
    }
  };

  useEffect(() => {
    if (!user) navigate("/connexion");
    else if (!isAdmin) navigate("/");
    else fetchData();
  }, [user, isAdmin]);

  if (loading) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        
        <h1 className="text-2xl font-bold text-blue-800 mb-2">⚙️ Administration</h1>
        <p className="text-gray-500 mb-6">Gérez les formations, actualités et inscriptions</p>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b">
          <button onClick={() => setActiveTab("formations")} className={`pb-2 px-2 ${activeTab === "formations" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
            📚 Formations ({formations.length})
          </button>
          <button onClick={() => setActiveTab("actualites")} className={`pb-2 px-2 ${activeTab === "actualites" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
            📰 Actualités ({actualites.length})
          </button>
        </div>

        {/* FORMATIONS AVEC INSCRIPTIONS */}
        {activeTab === "formations" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liste des formations</h2>
              <button onClick={() => navigate("/ajouter-formation")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">➕ Ajouter</button>
            </div>
            {formations.length === 0 ? (
              <p className="text-gray-500">Aucune formation</p>
            ) : (
              <div className="space-y-4">
                {formations.map(f => {
                  const inscriptions = inscriptionsByFormation[f.id] || [];
                  const nonContactes = inscriptions.filter(i => i.statut === "nouvelle" || i.statut === "nouveau");
                  const isExpanded = expandedFormation === f.id;
                  
                  return (
                    <div key={f.id} className="bg-white rounded-lg shadow overflow-hidden">
                      {/* En-tête de la formation */}
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg">{f.title}</h3>
                              {f.is_online && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🌍 En ligne</span>
                              )}
                              {f.onDemand && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🏢 Présentiel</span>
                              )}
                              {nonContactes.length > 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  📋 {nonContactes.length} demande(s) en attente
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{f.description?.substring(0, 100)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/modifier-formation/${f.id}`)} className="text-blue-600">✏️</button>
                            <button onClick={() => deleteFormation(f.id)} className="text-red-600">🗑️</button>
                          </div>
                        </div>
                        
                        {/* Code d'accès */}
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="text-sm text-gray-600">🔑 Code d'accès</span>
                          {accessCodes[f.id]?.access_code ? (
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{accessCodes[f.id].access_code}</code>
                              <button onClick={() => navigator.clipboard.writeText(accessCodes[f.id].access_code)} className="text-gray-500">📋</button>
                              <button onClick={() => generateCode(f.id)} disabled={generating} className="text-blue-500 text-sm">🔄</button>
                            </div>
                          ) : (
                            <button onClick={() => generateCode(f.id)} disabled={generating} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">🎲 Générer</button>
                          )}
                        </div>

                        {/* Bouton pour afficher/masquer les inscriptions */}
                        {inscriptions.length > 0 && (
                          <button
                            onClick={() => toggleFormationExpand(f.id)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {isExpanded ? "▲ Masquer les inscriptions" : "▼ Voir les inscriptions "}
                            <span className="text-gray-500">({inscriptions.length})</span>
                          </button>
                        )}
                      </div>

                      {/* Liste des inscriptions "À la demande" */}
                      {isExpanded && inscriptions.length > 0 && (
                        <div className="bg-gray-50 p-4">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>📝</span> Demandes "À la demande"
                            <span className="text-xs text-gray-500">({inscriptions.length})</span>
                          </h4>
                          <div className="space-y-2">
                            {inscriptions.map(demande => (
                              <div key={demande.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-start flex-wrap gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-gray-800">{demande.nom}</p>
                                      {demande.statut === "nouvelle" || demande.statut === "nouveau" ? (
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ Nouvelle</span>
                                      ) : (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Contacté</span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                                      <p className="text-gray-600">
                                        <span className="text-gray-400">📧</span> {demande.email}
                                      </p>
                                      <p className="text-gray-600">
                                        <span className="text-gray-400">📞</span> {demande.telephone}
                                      </p>
                                    </div>
                                    {demande.message && (
                                      <p className="text-sm text-gray-500 mt-2 italic">
                                        "{demande.message.substring(0, 100)}"
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                      Demandé le {new Date(demande.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <a
                                      href={`tel:${demande.telephone}`}
                                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                                    >
                                      📞 Appeler
                                    </a>
                                    <a
                                      href={`mailto:${demande.email}`}
                                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition"
                                    >
                                      ✉️ Email
                                    </a>
                                    {demande.statut !== "contacte" && (
                                      <button
                                        onClick={() => marquerContacte(demande.id)}
                                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                                      >
                                        ✅ Contacté
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTUALITÉS */}
        {activeTab === "actualites" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liste des actualités</h2>
              <button onClick={() => navigate("/ajouter-actualite")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">➕ Ajouter</button>
            </div>
            {actualites.length === 0 ? (
              <p className="text-gray-500">Aucune actualité</p>
            ) : (
              <div className="space-y-3">
                {actualites.map(a => (
                  <div key={a.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{a.titre}</h3>
                        <p className="text-gray-500 text-sm">{a.contenu?.substring(0, 100)}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/modifier-actualite/${a.id}`)} className="text-blue-600">✏️</button>
                        <button onClick={() => deleteActualite(a.id)} className="text-red-600">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauDeBordAdmin;