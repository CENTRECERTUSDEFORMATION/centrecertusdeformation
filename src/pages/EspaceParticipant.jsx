import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function EspaceParticipant() {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [accessCodes, setAccessCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [accessRole, setAccessRole] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [dailyFrame, setDailyFrame] = useState(null);
  const [showDaily, setShowDaily] = useState(false);

  // Récupérer les formations et leurs codes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Récupérer les formations
      const { data: formationsData, error: formationsError } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (formationsError) {
        toast.error("Erreur chargement des formations");
        setFormations([]);
      } else {
        setFormations(formationsData || []);
        
        // Récupérer les codes d'accès
        if (formationsData && formationsData.length > 0) {
          const { data: codesData } = await supabase
            .from("formation_access_codes")
            .select("*")
            .in("formation_id", formationsData.map(f => f.id))
            .eq("is_active", true);
          
          if (codesData) {
            const codesMap = {};
            codesData.forEach(code => {
              codesMap[code.formation_id] = {
                teacher_code: code.teacher_code,
                participant_code: code.participant_code
              };
            });
            setAccessCodes(codesMap);
          }
        }
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Charger le script Daily
  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@daily-co/daily-js"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@daily-co/daily-js";
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      if (dailyFrame) {
        dailyFrame.destroy();
      }
    };
  }, []);

  // Vérifier le code d'accès
  const verifyAccessCode = async () => {
    if (!enteredCode.trim()) {
      toast.error("Veuillez entrer un code d'accès");
      return;
    }

    setVerifying(true);

    try {
      const codes = accessCodes[selectedFormation.id];
      
      if (!codes) {
        toast.error("Codes non configurés pour cette formation");
        return;
      }

      const expectedCode = accessRole === "teacher" 
        ? codes.teacher_code 
        : codes.participant_code;

      if (enteredCode.toUpperCase() !== expectedCode) {
        toast.error("Code d'accès incorrect");
        return;
      }

      // Code valide - rejoindre la session
      await joinSession(selectedFormation, accessRole);

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification");
    } finally {
      setVerifying(false);
    }
  };

  // Rejoindre une session Daily
  const joinSession = async (formation, role) => {
    try {
      // Vérifier si une session existe déjà
      const { data: existingSession, error: fetchError } = await supabase
        .from("daily_sessions")
        .select("*")
        .eq("formation_id", formation.id)
        .eq("is_active", true)
        .maybeSingle();

      let roomUrl = existingSession?.daily_room_url;

      // Créer une nouvelle session si nécessaire
      if (!roomUrl) {
        const roomName = `certus-${formation.id}-${Date.now()}`;
        
        try {
          const response = await fetch("/api/create-daily-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName, formationId: formation.id })
          });
          
          const data = await response.json();
          
          if (data.success && data.url) {
            roomUrl = data.url;
            
            // Sauvegarder la session
            const { error: insertError } = await supabase
              .from("daily_sessions")
              .insert({
                formation_id: formation.id,
                daily_room_url: roomUrl,
                room_name: roomName,
                created_by: user.id,
                is_active: true
              });
            
            if (insertError) {
              console.error("Erreur sauvegarde session:", insertError);
            }
          } else {
            toast.error(data.error || "Impossible de créer la salle");
            return;
          }
        } catch (apiError) {
          console.error("Erreur API:", apiError);
          toast.error("Erreur de connexion au serveur");
          return;
        }
      }

      // Enregistrer la participation
      await supabase.from("session_participants").insert({
        formation_id: formation.id,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        role: role,
        joined_at: new Date().toISOString()
      });

      // Ouvrir la salle Daily
      if (window.DailyIframe) {
        const callFrame = window.DailyIframe.createFrame({
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: {
            width: "100%",
            height: "100%",
            border: "none",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999
          }
        });

        callFrame.join({
          url: roomUrl,
          userName: `${user.user_metadata?.full_name || user.email} (${role === "teacher" ? "Formateur" : "Participant"})`
        });

        callFrame.on("left-meeting", () => {
          callFrame.destroy();
          setShowDaily(false);
          setDailyFrame(null);
          toast.info("Vous avez quitté la réunion");
        });

        setDailyFrame(callFrame);
        setShowDaily(true);
        setShowCodeModal(false);
        setEnteredCode("");
      } else {
        toast.error("Chargement de Daily en cours, veuillez réessayer");
      }

    } catch (error) {
      console.error("Erreur joinSession:", error);
      toast.error("Erreur lors de la connexion à la salle");
    }
  };

  const openCodeModal = (formation, role) => {
    setSelectedFormation(formation);
    setAccessRole(role);
    setShowCodeModal(true);
    setEnteredCode("");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Espace Participant | Centre Certus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Interface Daily en plein écran */}
      <AnimatePresence>
        {showDaily && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black"
            id="daily-container"
          />
        )}
      </AnimatePresence>

      {/* Page principale */}
      {!showDaily && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Espace Participant
              </h1>
              <p className="text-gray-600 mt-2">
                Bienvenue, <span className="font-semibold text-[#1a56db]">{user?.user_metadata?.full_name || user?.email}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Accédez à vos formations en ligne avec votre code d'accès personnel
              </p>
            </div>

            {/* Liste des formations */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📚 Mes formations
            </h2>

            {formations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500">Aucune formation disponible</p>
                <p className="text-gray-400 text-sm mt-2">
                  Contactez l'administrateur pour être inscrit à une formation
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation) => (
                  <motion.div
                    key={formation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Image */}
                    {formation.images && formation.images[0] && (
                      <div className="h-36 overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(formation.images[0])}
                          alt={formation.title}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = "https://placehold.co/400x200?text=Formation")}
                        />
                      </div>
                    )}
                    
                    {/* Contenu */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {formation.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {formation.description || formation.fullDescription?.substring(0, 100) || "Formation professionnelle certifiante"}
                      </p>
                      
                      {/* Badges */}
                      <div className="flex gap-2 mb-4">
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
                      
                      {/* Boutons d'accès */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCodeModal(formation, "teacher")}
                          disabled={!accessCodes[formation.id]}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            accessCodes[formation.id]
                              ? "bg-[#1a56db] hover:bg-blue-700 text-white"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          👨‍🏫 Formateur
                        </button>
                        <button
                          onClick={() => openCodeModal(formation, "student")}
                          disabled={!accessCodes[formation.id]}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            accessCodes[formation.id]
                              ? "bg-[#76c21f] hover:bg-green-700 text-white"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          👨‍🎓 Participant
                        </button>
                      </div>
                      
                      {/* Indication si codes non configurés */}
                      {!accessCodes[formation.id] && (
                        <p className="text-xs text-orange-500 mt-3 text-center">
                          ⚠️ Codes non configurés (contacter l'administrateur)
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de saisie du code */}
      <AnimatePresence>
        {showCodeModal && !showDaily && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              {/* En-tête modal */}
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">
                      {accessRole === "teacher" ? "👨‍🏫 Accès Formateur" : "👨‍🎓 Accès Participant"}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">{selectedFormation?.title}</p>
                  </div>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="text-white/80 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Corps modal */}
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'accès
                </label>
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="ex: CERTUS-ABC123"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                  maxLength={20}
                  autoFocus
                />
                
                <p className="text-xs text-gray-400 text-center mt-2">
                  💡 Le code vous a été communiqué par l'administrateur
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={verifyAccessCode}
                    disabled={verifying || !enteredCode.trim()}
                    className="flex-1 bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {verifying ? "Vérification..." : "✅ Accéder à la formation"}
                  </button>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}