import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { supabaseSelect, supabaseInsert, supabaseDelete } from "../supabaseFetch";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const EspaceFormateur = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSeances, setLoadingSeances] = useState(false);
  const [showSeancesModal, setShowSeancesModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [newSeance, setNewSeance] = useState({
    titre: "",
    date_heure: "",
    duree: 60,
    lien_reunion: ""
  });
  const [addingSeance, setAddingSeance] = useState(false);
  
  const initialFetchDone = useRef(false);
  const authChecked = useRef(false);

  const extractDurationHours = useCallback((durationStr) => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }, []);

  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return;
    setLoadingData(true);
    try {
      const data = await supabaseSelect("formateur_assignments", `select=*,formations:formation_id(id,title,description,duration)&formateur_id=eq.${user.id}`);
      const formatted = (data || []).map(ass => ({ ...ass, formations: ass.formations ? { ...ass.formations, duree_totale: extractDurationHours(ass.formations.duration) } : null }));
      setAssignments(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement des formations");
    } finally {
      setLoadingData(false);
    }
  }, [user?.id, extractDurationHours]);

  const fetchSeances = useCallback(async (assignmentId) => {
    setLoadingSeances(true);
    try {
      const data = await supabaseSelect("seances", `assignment_id=eq.${assignmentId}&order=date_seance.asc`);
      setSeances(data || []);
    } catch (err) {
      toast.error("Erreur chargement séances");
    } finally {
      setLoadingSeances(false);
    }
  }, []);

  const addSeance = useCallback(async () => {
    if (!newSeance.titre.trim() || !newSeance.date_heure) {
      toast.error("Titre et date/heure requis");
      return;
    }
    setAddingSeance(true);
    try {
      await supabaseInsert("seances", {
        assignment_id: selectedAssignment.id,
        titre: newSeance.titre.trim(),
        date_seance: newSeance.date_heure,
        duree: newSeance.duree || 60,
        statut: "planifie",
        lien_reunion: newSeance.lien_reunion || null
      });
      toast.success("✅ Séance ajoutée");
      await fetchSeances(selectedAssignment.id);
      setNewSeance({ titre: "", date_heure: "", duree: 60, lien_reunion: "" });
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur: " + err.message);
    } finally {
      setAddingSeance(false);
    }
  }, [newSeance, selectedAssignment, fetchSeances]);

  const deleteSeance = useCallback(async (seanceId) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await supabaseDelete("seances", seanceId);
      toast.success("Séance supprimée");
      await fetchSeances(selectedAssignment.id);
    } catch (err) {
      toast.error("❌ Erreur: " + err.message);
    }
  }, [selectedAssignment, fetchSeances]);

  const genererLienJitsi = useCallback(() => {
    const nomSalle = `certus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setNewSeance(prev => ({ ...prev, lien_reunion: `https://meet.jit.si/${nomSalle}` }));
    toast.success("🔗 Lien Jitsi généré");
  }, []);

  const handleOpenSeancesModal = useCallback(async (ass) => {
    setSelectedAssignment(ass);
    await fetchSeances(ass.id);
    setShowSeancesModal(true);
  }, [fetchSeances]);

  const handleCloseSeancesModal = useCallback(() => {
    setShowSeancesModal(false);
    setSeances([]);
  }, []);

  const handleOpenCodeModal = useCallback((ass) => {
    setSelectedAssignment(ass);
    setAccessCode("");
    setShowCodeModal(true);
  }, []);

  const handleCloseCodeModal = useCallback(() => {
    setShowCodeModal(false);
    setAccessCode("");
    setVerifying(false);
  }, []);

  const verifyCodeAndStartSession = useCallback(async () => {
    if (!accessCode.trim()) {
      toast.error("Veuillez entrer un code");
      return;
    }
    setVerifying(true);
    try {
      console.log("🔍 Vérification du code:", accessCode.toUpperCase());
      
      const codeData = await supabaseSelect("formation_access_codes", `formation_id=eq.${selectedAssignment.formation_id}&access_code=eq.${accessCode.toUpperCase()}`);
      
      if (!codeData || codeData.length === 0) {
        toast.error("Code invalide pour cette formation");
        setVerifying(false);
        return;
      }

      console.log("✅ Code valide");

      const jitsiUrl = `https://meet.jit.si/certus_${selectedAssignment.formation_id}_${Date.now()}`;
      console.log("🔗 Lien Jitsi:", jitsiUrl);

      await supabaseInsert("seances", {
        assignment_id: selectedAssignment.id,
        titre: "Session en direct",
        date_seance: new Date().toISOString(),
        duree: 60,
        statut: "en_cours",
        lien_reunion: jitsiUrl,
        lien_partage_le: new Date().toISOString(),
        lien_partage_par: user?.id
      });

      console.log("✅ Séance créée");

      await navigator.clipboard.writeText(jitsiUrl);
      window.open(jitsiUrl, "_blank");
      
      toast.success("✅ Session démarrée ! Lien copié et disponible pour les participants");
      
      handleCloseCodeModal();
      await fetchSeances(selectedAssignment.id);
      
    } catch (err) {
      console.error("❌ Erreur:", err);
      toast.error("Erreur: " + (err.message || "inconnue"));
    } finally {
      setVerifying(false);
    }
  }, [accessCode, selectedAssignment, user?.id, fetchSeances, handleCloseCodeModal]);

  useEffect(() => {
    if (loading) return;
    if (authChecked.current) return;
    authChecked.current = true;
    if (!user) navigate("/connexion");
    else if (userType !== "formateur") { toast.error("Accès réservé aux formateurs"); navigate("/"); }
    else if (!isApproved) toast.warning("⏳ Votre compte formateur est en attente d'approbation");
  }, [user, userType, isApproved, loading, navigate]);

  useEffect(() => {
    if (user && userType === "formateur" && isApproved && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAssignments();
    }
  }, [user, userType, isApproved, fetchAssignments]);

  if (loading) return (
    <div className="flex justify-center items-center h-96 mt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]" aria-label="Chargement en cours"></div>
    </div>
  );
  
  if (!user || userType !== "formateur") return null;
  
  if (!isApproved) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Compte en attente</h2>
          <p className="text-gray-600">Votre compte formateur est en attente d'approbation par l'administrateur.</p>
        </div>
      </div>
    </div>
  );
  
  if (loadingData) return (
    <div className="flex justify-center items-center h-96 mt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]" aria-label="Chargement en cours"></div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Espace Formateur | Centre Certus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold">👨‍🏫 Espace Formateur</h1>
            <p className="text-purple-100 mt-1">Bienvenue, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">📚 Mes formations assignées</h2>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">Aucune formation ne vous a été assignée.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(ass => (
                  <div key={ass.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                      <h3 className="font-bold text-lg">{ass.formations?.title}</h3>
                      <p className="text-gray-300 text-sm mt-1">Groupe: {ass.groupe_nom}</p>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ass.formations?.description || "Aucune description"}</p>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleOpenSeancesModal(ass)} 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                          aria-label={`Gérer les séances de ${ass.formations?.title}`}
                        >
                          📅 Gérer les séances
                        </button>
                        <button 
                          onClick={() => handleOpenCodeModal(ass)} 
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          aria-label={`Démarrer une session pour ${ass.formations?.title}`}
                        >
                          🚀 Démarrer une session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL SÉANCES */}
      {showSeancesModal && selectedAssignment && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" 
          onClick={handleCloseSeancesModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="seances-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl sticky top-0 flex justify-between items-start">
              <div>
                <h3 id="seances-modal-title" className="text-xl font-bold">📅 Séances</h3>
                <p className="text-blue-100 text-sm">{selectedAssignment?.formations?.title} - {selectedAssignment?.groupe_nom}</p>
              </div>
              <button 
                onClick={handleCloseSeancesModal} 
                className="text-white hover:text-gray-200 text-xl"
                aria-label="Fermer le modal des séances"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-semibold mb-3">Séances existantes</h4>
              {loadingSeances ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" aria-label="Chargement des séances"></div>
                </div>
              ) : seances.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune séance</p>
              ) : (
                seances.map(s => (
                  <div key={s.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{s.titre}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(s.date_seance).toLocaleString()} - {s.duree} min
                        </p>
                        {s.lien_reunion && (
                          <a 
                            href={s.lien_reunion} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 hover:underline block mt-1 break-all"
                          >
                            🔗 {s.lien_reunion}
                          </a>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteSeance(s.id)} 
                        className="text-red-500 text-sm px-2 hover:text-red-700"
                        aria-label={`Supprimer la séance ${s.titre}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
              <h4 className="font-semibold mt-4 mb-3">➕ Ajouter une séance</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor="seance-title" className="sr-only">Titre de la séance</label>
                  <input 
                    id="seance-title"
                    type="text" 
                    placeholder="Titre de la séance" 
                    className="border rounded-lg p-2 w-full" 
                    value={newSeance.titre} 
                    onChange={e => setNewSeance({ ...newSeance, titre: e.target.value })} 
                  />
                </div>
                <div>
                  <label htmlFor="seance-datetime" className="sr-only">Date et heure</label>
                  <input 
                    id="seance-datetime"
                    type="datetime-local" 
                    className="border rounded-lg p-2 w-full" 
                    value={newSeance.date_heure} 
                    onChange={e => setNewSeance({ ...newSeance, date_heure: e.target.value })} 
                  />
                </div>
                <div>
                  <label htmlFor="seance-duration" className="sr-only">Durée (minutes)</label>
                  <input 
                    id="seance-duration"
                    type="number" 
                    placeholder="Durée (minutes)" 
                    className="border rounded-lg p-2 w-full" 
                    value={newSeance.duree} 
                    onChange={e => setNewSeance({ ...newSeance, duree: parseInt(e.target.value) || 60 })} 
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="seance-link" className="sr-only">Lien Jitsi / Zoom / Meet</label>
                    <input 
                      id="seance-link"
                      type="text" 
                      placeholder="Lien Jitsi / Zoom / Meet" 
                      className="border rounded-lg p-2 w-full" 
                      value={newSeance.lien_reunion} 
                      onChange={e => setNewSeance({ ...newSeance, lien_reunion: e.target.value })} 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={genererLienJitsi} 
                    className="bg-gray-200 text-gray-700 px-3 rounded-lg text-sm hover:bg-gray-300 transition"
                    aria-label="Générer un lien Jitsi"
                  >
                    🎲 Générer Jitsi
                  </button>
                </div>
                <button 
                  onClick={addSeance} 
                  disabled={addingSeance} 
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {addingSeance ? "Ajout..." : "➕ Ajouter la séance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CODE */}
      {showCodeModal && selectedAssignment && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
          onClick={handleCloseCodeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="code-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-t-2xl flex justify-between items-start">
              <div>
                <h3 id="code-modal-title" className="text-xl font-bold">Démarrer une session</h3>
                <p className="text-green-100 text-sm">{selectedAssignment?.formations?.title} - {selectedAssignment?.groupe_nom}</p>
              </div>
              <button 
                onClick={handleCloseCodeModal} 
                className="text-white hover:text-gray-200 text-xl"
                aria-label="Fermer le modal du code d'accès"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                  🔑 Code d'accès
                </label>
                <input 
                  id="access-code"
                  type="text" 
                  placeholder="Ex: X7K9M2P4" 
                  className="w-full border rounded-lg p-3 uppercase font-mono text-center text-lg tracking-wider" 
                  value={accessCode} 
                  onChange={e => setAccessCode(e.target.value.toUpperCase())} 
                  autoFocus 
                  maxLength={8} 
                />
                <p className="text-xs text-gray-500 mt-2">Code communiqué par l'administrateur pour cette formation</p>
              </div>
              <button 
                onClick={verifyCodeAndStartSession} 
                disabled={verifying || !accessCode.trim()} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-label="Vérification en cours"></div>
                    Vérification...
                  </span>
                ) : "✅ Vérifier et démarrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspaceFormateur;