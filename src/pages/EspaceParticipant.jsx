import React, { useEffect, useState, useRef } from "react";
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
  const [showJitsi, setShowJitsi] = useState(false);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  // Récupérer les formations et leurs codes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: formationsData } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (formationsData) {
        setFormations(formationsData);
        
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
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Charger le script Jitsi
  useEffect(() => {
    if (!document.querySelector('script[src="https://meet.jit.si/external_api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
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

      await joinJitsiRoom();

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la vérification");
    } finally {
      setVerifying(false);
    }
  };

  // Rejoindre une salle Jitsi
  const joinJitsiRoom = async () => {
    try {
      const roomName = `CERTUS-${enteredCode}`;
      const roomUrl = `https://meet.jit.si/${roomName}`;
      
      // Enregistrer la session
      const { data: session } = await supabase
        .from("jitsi_sessions")
        .insert({
          formation_id: selectedFormation.id,
          room_name: roomName,
          room_url: roomUrl,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      // Enregistrer la participation
      await supabase.from("jitsi_participants").insert({
        session_id: session?.id,
        formation_id: selectedFormation.id,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        role: accessRole,
        joined_at: new Date().toISOString()
      });

      setShowJitsi(true);
      
      // Attendre que le DOM soit prêt
      setTimeout(() => {
        if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
          const domain = "meet.jit.si";
          const options = {
            roomName: roomName,
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: `${user.user_metadata?.full_name || user.email} (${accessRole === "teacher" ? "Formateur" : "Participant"})`
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableClosePage: true
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false
            }
          };

          const api = new window.JitsiMeetExternalAPI(domain, options);
          jitsiApiRef.current = api;

          api.addEventListener("readyToClose", () => {
            api.dispose();
            jitsiApiRef.current = null;
            setShowJitsi(false);
          });
        }
      }, 500);

      setShowCodeModal(false);
      setEnteredCode("");

    } catch (error) {
      console.error("Erreur Jitsi:", error);
      toast.error("Erreur lors de la connexion");
      setShowJitsi(false);
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

      {/* Interface Jitsi en plein écran */}
      <AnimatePresence>
        {showJitsi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black"
          >
            <div ref={jitsiContainerRef} className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page principale */}
      {!showJitsi && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Participant</h1>
            <p className="text-gray-600 mb-8">
              Bienvenue, <span className="font-semibold text-[#1a56db]">{user?.user_metadata?.full_name || user?.email}</span>
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Mes formations</h2>

            {formations.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">Aucune formation disponible</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation) => (
                  <div key={formation.id} className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-lg font-bold text-gray-800">{formation.title}</h3>
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => openCodeModal(formation, "teacher")}
                        disabled={!accessCodes[formation.id]}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                          accessCodes[formation.id]
                            ? "bg-[#1a56db] text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        👨‍🏫 Formateur
                      </button>
                      <button
                        onClick={() => openCodeModal(formation, "student")}
                        disabled={!accessCodes[formation.id]}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                          accessCodes[formation.id]
                            ? "bg-[#76c21f] text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        👨‍🎓 Participant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de saisie du code */}
      <AnimatePresence>
        {showCodeModal && !showJitsi && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {accessRole === "teacher" ? "👨‍🏫 Formateur" : "👨‍🎓 Participant"}
                  </h3>
                  <button onClick={() => setShowCodeModal(false)} className="text-white text-2xl">×</button>
                </div>
                <p className="text-blue-100 text-sm mt-1">{selectedFormation?.title}</p>
              </div>

              <div className="p-6">
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="Code d'accès"
                  className="w-full border rounded-xl px-4 py-3 text-center text-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  autoFocus
                />
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={verifyAccessCode}
                    disabled={verifying || !enteredCode.trim()}
                    className="flex-1 bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {verifying ? "Vérification..." : "Accéder"}
                  </button>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
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