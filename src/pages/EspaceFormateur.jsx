// frontend/src/pages/EspaceFormateur.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const EspaceFormateur = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [jitsiLink, setJitsiLink] = useState("");

  const extractDurationHours = (durationStr) => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/connexion");
      else if (userType !== "formateur") {
        toast.error("Accès réservé aux formateurs");
        navigate("/");
      } else if (!isApproved) toast.warning("Compte en attente d'approbation");
    }
  }, [user, userType, isApproved, loading, navigate]);

  useEffect(() => {
    if (user && userType === "formateur" && isApproved) {
      fetchAssignments();
    }
  }, [user, userType, isApproved]);

  const fetchAssignments = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("formateur_assignments")
        .select(`
          *,
          formations:formation_id (
            id, 
            title, 
            description, 
            duration
          )
        `)
        .eq("formateur_id", user.id);

      if (error) throw error;
      
      const formatted = (data || []).map(ass => ({
        ...ass,
        formations: ass.formations ? {
          ...ass.formations,
          duree_totale: extractDurationHours(ass.formations.duration)
        } : null
      }));
      setAssignments(formatted);
    } catch (err) {
      console.error("Erreur fetchAssignments:", err);
      toast.error("Erreur chargement des formations");
    } finally {
      setLoadingData(false);
    }
  };

  const verifyCodeAndStartSession = async () => {
    if (!accessCode.trim()) {
      toast.error("Veuillez entrer un code");
      return;
    }
    setVerifying(true);
    try {
      // 1. Vérifier le code d'accès
      const { data: codeData, error: codeError } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", selectedAssignment.formation_id)
        .eq("access_code", accessCode.toUpperCase())
        .maybeSingle();

      if (codeError || !codeData) {
        toast.error("Code invalide pour cette formation");
        return;
      }

      // 2. Générer le lien Jitsi
      const roomName = `certus_${selectedAssignment.formation_id}_${Date.now()}`;
      const jitsiUrl = `https://meet.jit.si/${roomName}`;

      // 3. Créer la session active
      const { error: sessionError } = await supabase
        .from("active_sessions")
        .insert({
          formation_id: selectedAssignment.formation_id,
          jitsi_link: jitsiUrl,
          started_by: user.id,
          is_active: true,
          started_at: new Date().toISOString()
        });

      if (sessionError) {
        console.error("Erreur détaillée sessionError:", sessionError);
        throw sessionError;
      }

      setJitsiLink(jitsiUrl);
      await navigator.clipboard.writeText(jitsiUrl);
      toast.success("✅ Session démarrée ! Lien copié");
      window.open(jitsiUrl, "_blank");
      setTimeout(() => setShowCodeModal(false), 2000);
    } catch (err) {
      console.error("Erreur verifyCodeAndStartSession:", err);
      toast.error("Erreur lors du démarrage de la session: " + (err.message || "inconnue"));
    } finally {
      setVerifying(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(jitsiLink);
    toast.success("Lien copié !");
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }
  
  if (!user || userType !== "formateur") return null;

  return (
    <>
      <Helmet><title>Espace Formateur | Centre Certus</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold">Espace Formateur</h1>
            <p className="text-blue-100 mt-1">Bienvenue, {user?.full_name || user?.email}</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Mes formations assignées</h2>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">Aucune formation assignée.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map(ass => (
                  <div key={ass.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-800 text-white p-4">
                      <h3 className="font-bold text-lg">{ass.formations?.title}</h3>
                      <p className="text-gray-300 text-sm">Groupe: {ass.groupe_nom}</p>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-gray-600 mb-4">{ass.formations?.description}</p>
                      <button 
                        onClick={() => { 
                          setSelectedAssignment(ass); 
                          setAccessCode(""); 
                          setJitsiLink(""); 
                          setShowCodeModal(true); 
                        }} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                      >
                        🚀 Démarrer une session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Code */}
      {showCodeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-t-2xl">
              <h3 className="text-xl font-bold">Démarrer une session</h3>
              <p className="text-green-100 text-sm">{selectedAssignment.formations?.title} - {selectedAssignment.groupe_nom}</p>
            </div>
            <div className="p-6 space-y-4">
              {!jitsiLink ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code d'accès</label>
                    <input 
                      type="text" 
                      placeholder="Code fourni par l'admin" 
                      className="w-full border rounded-lg p-3 uppercase" 
                      value={accessCode} 
                      onChange={e => setAccessCode(e.target.value.toUpperCase())} 
                      autoFocus 
                    />
                    <p className="text-xs text-gray-500 mt-1">Code communiqué par l'administrateur</p>
                  </div>
                  <button 
                    onClick={verifyCodeAndStartSession} 
                    disabled={verifying} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {verifying ? "Vérification..." : "✅ Vérifier et démarrer"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✅ Session démarrée !</p>
                    <p className="text-sm text-green-600 mt-1">Lien Jitsi :</p>
                    <div className="flex gap-2 mt-2">
                      <input type="text" value={jitsiLink} readOnly className="flex-1 border rounded-lg p-2 text-sm bg-gray-50" />
                      <button onClick={copyLink} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Copier</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Partagez ce lien avec vos participants</p>
                  </div>
                  <button onClick={() => setShowCodeModal(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold">
                    Fermer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspaceFormateur;