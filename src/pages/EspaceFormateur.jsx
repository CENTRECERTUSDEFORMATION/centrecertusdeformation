// frontend/src/pages/EspaceFormateur.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
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

  const extractDurationHours = (durationStr) => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("formateur_assignments")
        .select(`*, formations:formation_id (id, title, description, duration)`)
        .eq("formateur_id", user.id);
      if (error) throw error;
      const formatted = (data || []).map(ass => ({ ...ass, formations: ass.formations ? { ...ass.formations, duree_totale: extractDurationHours(ass.formations.duration) } : null }));
      setAssignments(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement des formations");
    } finally {
      setLoadingData(false);
    }
  }, [user?.id]);

  const fetchSeances = async (assignmentId) => {
    setLoadingSeances(true);
    try {
      const { data, error } = await supabase
        .from("seances")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("date_seance", { ascending: true });
      if (error) throw error;
      setSeances(data || []);
    } catch (err) {
      toast.error("Erreur chargement séances");
    } finally {
      setLoadingSeances(false);
    }
  };

  const addSeance = async () => {
    if (!newSeance.titre.trim() || !newSeance.date_heure) {
      toast.error("Titre et date/heure requis");
      return;
    }
    setAddingSeance(true);
    try {
      await supabase.from("seances").insert({
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
      toast.error("❌ Erreur");
    } finally {
      setAddingSeance(false);
    }
  };

  const deleteSeance = async (seanceId) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await supabase.from("seances").delete().eq("id", seanceId);
      toast.success("Séance supprimée");
      await fetchSeances(selectedAssignment.id);
    } catch (err) {
      toast.error("❌ Erreur");
    }
  };

  const genererLienJitsi = () => {
    const nomSalle = `certus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setNewSeance({ ...newSeance, lien_reunion: `https://meet.jit.si/${nomSalle}` });
    toast.success("🔗 Lien Jitsi généré");
  };

  const verifyCodeAndStartSession = async () => {
    if (!accessCode.trim()) {
      toast.error("Veuillez entrer un code");
      return;
    }
    setVerifying(true);
    try {
      console.log("1. Vérification du code:", accessCode.toUpperCase(), "formation_id:", selectedAssignment.formation_id);
      
      // 1. Vérifier le code d'accès
      const { data: codeData, error: codeError } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", selectedAssignment.formation_id)
        .eq("access_code", accessCode.toUpperCase())
        .maybeSingle();

      console.log("2. Résultat vérification code:", { codeData, codeError });

      if (codeError || !codeData) {
        toast.error("Code invalide pour cette formation");
        setVerifying(false);
        return;
      }

      // 2. Générer le lien Jitsi
      const roomName = `certus_${selectedAssignment.formation_id}_${Date.now()}`;
      const jitsiUrl = `https://meet.jit.si/${roomName}`;
      console.log("3. Lien Jitsi généré:", jitsiUrl);

      // 3. Vérifier que selectedAssignment.id existe
      if (!selectedAssignment.id) {
        console.error("selectedAssignment.id est manquant!");
        toast.error("Erreur: assignment_id manquant");
        setVerifying(false);
        return;
      }

      // 4. Créer la séance
      const seanceData = {
        assignment_id: selectedAssignment.id,
        titre: "Session en direct",
        date_seance: new Date().toISOString(),
        duree: 60,
        statut: "en_cours",
        lien_reunion: jitsiUrl,
        lien_partage_le: new Date().toISOString(),
        lien_partage_par: user?.id
      };
      console.log("4. Insertion séance:", seanceData);

      const { data: newSeance, error: seanceError } = await supabase
        .from("seances")
        .insert(seanceData)
        .select();

      console.log("5. Résultat insertion:", { newSeance, seanceError });

      if (seanceError) {
        console.error("Erreur détaillée seanceError:", seanceError);
        toast.error("Erreur lors de la création: " + (seanceError.message || "inconnue"));
        setVerifying(false);
        return;
      }

      // 5. Copier le lien
      await navigator.clipboard.writeText(jitsiUrl);
      
      // 6. Ouvrir Jitsi
      window.open(jitsiUrl, "_blank");
      
      // 7. Succès
      toast.success("✅ Session démarrée ! Lien copié et disponible pour les participants");
      
      // 8. Fermer le modal
      setShowCodeModal(false);
      setAccessCode("");
      
      // 9. Rafraîchir les séances
      await fetchSeances(selectedAssignment.id);
      
    } catch (err) {
      console.error("Erreur catch verifyCodeAndStartSession:", err);
      toast.error("Erreur lors du démarrage de la session: " + (err.message || "inconnue"));
    } finally {
      setVerifying(false);
    }
  };

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

  if (loading) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;
  if (!user || userType !== "formateur") return null;
  if (!isApproved) return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20"><div className="max-w-2xl mx-auto p-6"><div className="bg-white rounded-2xl shadow-xl p-8 text-center"><div className="text-6xl mb-4">⏳</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Compte en attente</h2><p className="text-gray-600">Votre compte formateur est en attente d'approbation par l'administrateur.</p></div></div></div>;
  if (loadingData) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;

  return (
    <>
      <Helmet><title>Espace Formateur | Centre Certus</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold">👨‍🏫 Espace Formateur</h1>
            <p className="text-purple-100 mt-1">Bienvenue, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">📚 Mes formations assignées</h2>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center"><p className="text-gray-500">Aucune formation ne vous a été assignée.</p></div>
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
                        <button onClick={async () => { setSelectedAssignment(ass); await fetchSeances(ass.id); setShowSeancesModal(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">📅 Gérer les séances</button>
                        <button onClick={() => { setSelectedAssignment(ass); setAccessCode(""); setShowCodeModal(true); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">🚀 Démarrer une session</button>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowSeancesModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl sticky top-0 flex justify-between"><div><h3 className="text-xl font-bold">📅 Séances</h3><p className="text-blue-100 text-sm">{selectedAssignment.formations?.title} - {selectedAssignment.groupe_nom}</p></div><button onClick={() => setShowSeancesModal(false)}>✕</button></div>
            <div className="p-6">
              <h4 className="font-semibold mb-3">Séances existantes</h4>
              {loadingSeances ? <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div> : seances.length === 0 ? <p className="text-gray-500 text-center py-4">Aucune séance</p> : seances.map(s => (<div key={s.id} className="bg-gray-50 rounded-lg p-3 mb-2"><div className="flex justify-between items-start"><div><p className="font-medium">{s.titre}</p><p className="text-xs text-gray-500">{new Date(s.date_seance).toLocaleString()} - {s.duree} min</p>{s.lien_reunion && <a href={s.lien_reunion} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block mt-1 break-all">🔗 {s.lien_reunion}</a>}</div><button onClick={() => deleteSeance(s.id)} className="text-red-500 text-sm px-2">🗑️</button></div></div>))}
              <h4 className="font-semibold mt-4 mb-3">➕ Ajouter une séance</h4>
              <div className="grid grid-cols-1 gap-3">
                <input type="text" placeholder="Titre de la séance" className="border rounded-lg p-2" value={newSeance.titre} onChange={e => setNewSeance({ ...newSeance, titre: e.target.value })} />
                <input type="datetime-local" className="border rounded-lg p-2" value={newSeance.date_heure} onChange={e => setNewSeance({ ...newSeance, date_heure: e.target.value })} />
                <input type="number" placeholder="Durée (minutes)" className="border rounded-lg p-2" value={newSeance.duree} onChange={e => setNewSeance({ ...newSeance, duree: parseInt(e.target.value) || 60 })} />
                <div className="flex gap-2"><input type="text" placeholder="Lien Jitsi / Zoom / Meet" className="border rounded-lg p-2 flex-1" value={newSeance.lien_reunion} onChange={e => setNewSeance({ ...newSeance, lien_reunion: e.target.value })} /><button type="button" onClick={genererLienJitsi} className="bg-gray-200 text-gray-700 px-3 rounded-lg text-sm hover:bg-gray-300">🎲 Générer Jitsi</button></div>
                <button onClick={addSeance} disabled={addingSeance} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{addingSeance ? "Ajout..." : "➕ Ajouter la séance"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CODE */}
      {showCodeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCodeModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-t-2xl flex justify-between"><div><h3 className="text-xl font-bold">Démarrer une session</h3><p className="text-green-100 text-sm">{selectedAssignment.formations?.title} - {selectedAssignment.groupe_nom}</p></div><button onClick={() => setShowCodeModal(false)}>✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">🔑 Code d'accès</label><input type="text" placeholder="Ex: X7K9M2P4" className="w-full border rounded-lg p-3 uppercase font-mono text-center text-lg tracking-wider" value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} autoFocus maxLength={8} /><p className="text-xs text-gray-500 mt-2">Code communiqué par l'administrateur pour cette formation</p></div>
              <button onClick={verifyCodeAndStartSession} disabled={verifying || !accessCode.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition">{verifying ? <span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Vérification...</span> : "✅ Vérifier et démarrer"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspaceFormateur;