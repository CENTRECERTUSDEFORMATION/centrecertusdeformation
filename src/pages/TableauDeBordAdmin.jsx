// frontend/src/pages/TableauDeBordAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "../supabaseFetch";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formations, setFormations] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [accessCodes, setAccessCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("formations");
  const [expandedFormation, setExpandedFormation] = useState(null);
  const [expandedType, setExpandedType] = useState(null); // 'en_ligne' ou 'presentiel'
  
  // États pour les inscriptions
  const [inscriptionsEnLigne, setInscriptionsEnLigne] = useState({});
  const [inscriptionsPresentiel, setInscriptionsPresentiel] = useState({});
  const [loadingInscriptions, setLoadingInscriptions] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // Formations
      const formationsData = await supabaseSelect("formations", "order=created_at.desc");
      setFormations(formationsData || []);

      // Codes d'accès
      if (formationsData?.length > 0) {
        const codesData = await supabaseSelect("formation_access_codes", `formation_id=in.(${formationsData.map(f => f.id).join(',')})`);
        
        if (codesData) {
          const codesMap = {};
          codesData.forEach(code => {
            codesMap[code.formation_id] = code;
          });
          setAccessCodes(codesMap);
        }
      }

      // Charger les inscriptions pour toutes les formations
      await fetchAllInscriptions(formationsData || []);

      // Actualités
      const actualitesData = await supabaseSelect("actualites", "order=created_at.desc");
      setActualites(actualitesData || []);

    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  // Charger toutes les inscriptions (en ligne et présentiel)
  const fetchAllInscriptions = async (formationsList) => {
    if (!formationsList.length) return;

    // 1. Récupérer les inscriptions en ligne (table inscriptions)
    const inscriptionsData = await supabaseSelect("inscriptions", `select=*,users:user_id(id,email,full_name)&formation_id=in.(${formationsList.map(f => f.id).join(',')})`);

    // 2. Récupérer les demandes présentiel (table demandes_presentiel)
    const demandesData = await supabaseSelect("demandes_presentiel", `formation_id=in.(${formationsList.map(f => f.id).join(',')})&order=created_at.desc`);

    // Organiser les inscriptions en ligne par formation
    const enLigneMap = {};
    if (inscriptionsData) {
      inscriptionsData.forEach(ins => {
        if (!enLigneMap[ins.formation_id]) {
          enLigneMap[ins.formation_id] = [];
        }
        enLigneMap[ins.formation_id].push(ins);
      });
    }
    setInscriptionsEnLigne(enLigneMap);

    // Organiser les demandes présentiel par formation
    const presentielMap = {};
    if (demandesData) {
      demandesData.forEach(demande => {
        if (!presentielMap[demande.formation_id]) {
          presentielMap[demande.formation_id] = [];
        }
        presentielMap[demande.formation_id].push(demande);
      });
    }
    setInscriptionsPresentiel(presentielMap);
  };

  // Recharger les inscriptions pour une formation spécifique
  const fetchFormationInscriptions = async (formationId) => {
    setLoadingInscriptions(prev => ({ ...prev, [formationId]: true }));
    try {
      // Inscriptions en ligne
      const inscriptionsData = await supabaseSelect("inscriptions", `select=*,users:user_id(id,email,full_name)&formation_id=eq.${formationId}`);

      // Demandes présentiel
      const demandesData = await supabaseSelect("demandes_presentiel", `formation_id=eq.${formationId}&order=created_at.desc`);

      setInscriptionsEnLigne(prev => ({ ...prev, [formationId]: inscriptionsData || [] }));
      setInscriptionsPresentiel(prev => ({ ...prev, [formationId]: demandesData || [] }));
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement inscriptions");
    } finally {
      setLoadingInscriptions(prev => ({ ...prev, [formationId]: false }));
    }
  };

  // Marquer une demande présentiel comme contactée
  const marquerContacte = async (demandeId, formationId) => {
    try {
      await supabaseUpdate("demandes_presentiel", demandeId, { 
        statut: "contacte", 
        contacte_le: new Date().toISOString() 
      });
      
      toast.success("✅ Demandeur marqué comme contacté");
      await fetchFormationInscriptions(formationId);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Valider une inscription en ligne
  const validerInscription = async (inscriptionId, formationId, userId) => {
    try {
      await supabaseUpdate("inscriptions", inscriptionId, { 
        statut: "confirme",
        date_confirmation: new Date().toISOString()
      });
      
      toast.success("✅ Inscription validée");
      await fetchFormationInscriptions(formationId);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la validation");
    }
  };

  // Annuler/Rejeter une inscription
  const rejeterInscription = async (inscriptionId, formationId) => {
    if (!confirm("Confirmer le rejet de cette inscription ?")) return;
    
    try {
      await supabaseUpdate("inscriptions", inscriptionId, { statut: "annule" });
      
      toast.success("❌ Inscription rejetée");
      await fetchFormationInscriptions(formationId);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du rejet");
    }
  };

  const generateCode = async (formationId) => {
    setGenerating(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const existing = await supabaseSelect("formation_access_codes", `formation_id=eq.${formationId}`);
      
      if (existing && existing.length > 0) {
        await supabaseUpdate("formation_access_codes", existing[0].id, { 
          teacher_code: newCode, 
          participant_code: newCode, 
          access_code: newCode 
        });
      } else {
        await supabaseInsert("formation_access_codes", { 
          formation_id: formationId, 
          teacher_code: newCode, 
          participant_code: newCode, 
          access_code: newCode 
        });
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
    try {
      await supabaseDelete("formations", id);
      setFormations(prev => prev.filter(f => f.id !== id));
      toast.success("Formation supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const deleteActualite = async (id) => {
    if (!confirm("Supprimer cette actualité ?")) return;
    try {
      await supabaseDelete("actualites", id);
      setActualites(prev => prev.filter(a => a.id !== id));
      toast.success("Actualité supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleFormationExpand = (formationId, type) => {
    if (expandedFormation === formationId && expandedType === type) {
      setExpandedFormation(null);
      setExpandedType(null);
    } else {
      setExpandedFormation(formationId);
      setExpandedType(type);
      // Charger les inscriptions si pas déjà fait
      if (!inscriptionsEnLigne[formationId] && !inscriptionsPresentiel[formationId]) {
        fetchFormationInscriptions(formationId);
      }
    }
  };

  useEffect(() => {
    if (!user) navigate("/connexion");
    else if (!isAdmin) navigate("/");
    else fetchData();
  }, [user, isAdmin]);

  if (loading) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;

  // Obtenir le compteur pour une formation
  const getEnLigneCount = (formationId) => {
    return inscriptionsEnLigne[formationId]?.length || 0;
  };

  const getPresentielCount = (formationId) => {
    return inscriptionsPresentiel[formationId]?.length || 0;
  };

  // Rendu de la liste des inscriptions en ligne
  const renderEnLigneList = (formation) => {
    const inscriptions = inscriptionsEnLigne[formation.id] || [];
    const isLoading = loadingInscriptions[formation.id];
    
    if (isLoading) {
      return <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>;
    }
    
    if (inscriptions.length === 0) {
      return <p className="text-gray-500 text-center py-4">Aucune inscription en ligne</p>;
    }
    
    return (
      <div className="space-y-2">
        {inscriptions.map(ins => (
          <div key={ins.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800">{ins.users?.full_name || "—"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ins.statut === 'confirme' ? 'bg-green-100 text-green-700' :
                    ins.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {ins.statut === 'confirme' ? '✅ Confirmé' :
                     ins.statut === 'en_attente' ? '⏳ En attente' : '❌ Annulé'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{ins.users?.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inscrit le {new Date(ins.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {ins.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => validerInscription(ins.id, formation.id, ins.user_id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      ✅ Valider
                    </button>
                    <button
                      onClick={() => rejeterInscription(ins.id, formation.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      ❌ Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rendu de la liste des demandes présentiel
  const renderPresentielList = (formation) => {
    const demandes = inscriptionsPresentiel[formation.id] || [];
    const isLoading = loadingInscriptions[formation.id];
    
    if (isLoading) {
      return <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>;
    }
    
    if (demandes.length === 0) {
      return <p className="text-gray-500 text-center py-4">Aucune demande présentiel</p>;
    }
    
    return (
      <div className="space-y-2">
        {demandes.map(demande => (
          <div key={demande.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800">{demande.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    demande.statut === 'contacte' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {demande.statut === 'contacte' ? '✅ Contacté' : '⏳ Nouvelle demande'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                  <p className="text-gray-600">📧 {demande.email}</p>
                  <p className="text-gray-600">📞 {demande.telephone}</p>
                </div>
                {demande.message && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{demande.message.substring(0, 100)}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Demandé le {new Date(demande.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${demande.telephone}`}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  📞 Appeler
                </a>
                <a
                  href={`mailto:${demande.email}`}
                  className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                >
                  ✉️ Email
                </a>
                {demande.statut !== 'contacte' && (
                  <button
                    onClick={() => marquerContacte(demande.id, formation.id)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    ✅ Contacté
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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

        {/* FORMATIONS AVEC INSCRIPTIONS - Le JSX reste inchangé */}
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
                  const enLigneCount = getEnLigneCount(f.id);
                  const presentielCount = getPresentielCount(f.id);
                  
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

                        {/* Boutons avec compteurs */}
                        <div className="mt-3 pt-3 border-t flex gap-3">
                          {f.is_online && (
                            <button
                              onClick={() => toggleFormationExpand(f.id, 'en_ligne')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                                expandedFormation === f.id && expandedType === 'en_ligne'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              <span>🌍</span>
                              <span>En ligne</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                expandedFormation === f.id && expandedType === 'en_ligne'
                                  ? 'bg-white text-blue-600'
                                  : 'bg-blue-200 text-blue-700'
                              }`}>
                                {enLigneCount}
                              </span>
                            </button>
                          )}
                          
                          {f.onDemand && (
                            <button
                              onClick={() => toggleFormationExpand(f.id, 'presentiel')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                                expandedFormation === f.id && expandedType === 'presentiel'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              }`}
                            >
                              <span>🏢</span>
                              <span>Présentiel</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                expandedFormation === f.id && expandedType === 'presentiel'
                                  ? 'bg-white text-orange-600'
                                  : 'bg-orange-200 text-orange-700'
                              }`}>
                                {presentielCount}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Liste des inscriptions - En ligne */}
                      {expandedFormation === f.id && expandedType === 'en_ligne' && f.is_online && (
                        <div className="bg-blue-50 p-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <span>🌍</span> Inscriptions en ligne
                            <span className="text-xs text-blue-600">({enLigneCount})</span>
                          </h4>
                          {renderEnLigneList(f)}
                        </div>
                      )}

                      {/* Liste des inscriptions - Présentiel */}
                      {expandedFormation === f.id && expandedType === 'presentiel' && f.onDemand && (
                        <div className="bg-orange-50 p-4">
                          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                            <span>🏢</span> Demandes présentiel
                            <span className="text-xs text-orange-600">({presentielCount})</span>
                          </h4>
                          {renderPresentielList(f)}
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