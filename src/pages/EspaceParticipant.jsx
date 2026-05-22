// frontend/src/pages/EspaceParticipant.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const EspaceParticipant = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [activeSessions, setActiveSessions] = useState([]);
  const [myFormations, setMyFormations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/connexion");
      else if (userType !== "participant") {
        toast.error("Accès réservé aux participants");
        navigate("/");
      } else if (!isApproved) toast.warning("Compte en attente d'approbation");
    }
  }, [user, userType, isApproved, loading, navigate]);

  useEffect(() => {
    if (user && userType === "participant" && isApproved) {
      fetchData();
      const interval = setInterval(fetchActiveSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [user, userType, isApproved]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([fetchActiveSessions(), fetchMyFormations()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("active_sessions")
        .select("*")
        .eq("is_active", true)
        .order("started_at", { ascending: false });

      if (error) throw error;

      const sessionsWithDetails = await Promise.all(
        (data || []).map(async (session) => {
          const { data: formation } = await supabase
            .from("formations")
            .select("id, title, description")
            .eq("id", session.formation_id)
            .single();
          return { ...session, formations: formation };
        })
      );
      setActiveSessions(sessionsWithDetails);
    } catch (err) {
      console.error("Erreur chargement sessions actives:", err);
    }
  };

  const fetchMyFormations = async () => {
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, formations:formation_id (id, title, description, duration)`)
        .eq("user_id", user.id);
      if (error) throw error;
      setMyFormations(data || []);
    } catch (err) {
      console.error("Erreur chargement mes formations:", err);
    }
  };

  const joinSession = (session) => {
    if (session.jitsi_link) {
      window.open(session.jitsi_link, "_blank");
      toast.success("Ouverture de la salle...");
    } else {
      toast.error("Lien non disponible");
    }
  };

  if (loading || loadingData) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;
  if (!user || userType !== "participant") return null;

  return (
    <>
      <Helmet><title>Espace Participant | Centre Certus</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold">Espace Participant</h1>
            <p className="text-blue-100 mt-1">Bienvenue, {user?.full_name || user?.email}</p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-green-600">🟢</span> Sessions en direct</h2>
            {activeSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center"><p className="text-gray-500">Aucune session active.</p><p className="text-sm text-gray-400 mt-2">Attendez que votre formateur démarre une session.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white"><h3 className="font-bold text-lg">{session.formations?.title}</h3><p className="text-green-100 text-sm">Démarrée à {new Date(session.started_at).toLocaleTimeString()}</p></div>
                    <div className="p-5"><p className="text-gray-600 text-sm mb-4">{session.formations?.description}</p><button onClick={() => joinSession(session)} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2">🎥 Rejoindre la session</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div><h2 className="text-xl font-bold text-gray-800 mb-4">📚 Mes formations</h2>
            {myFormations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center"><p className="text-gray-500">Vous n'êtes inscrit à aucune formation.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFormations.map(ins => (
                  <div key={ins.id} className="bg-white rounded-xl shadow-md overflow-hidden"><div className="bg-gray-800 text-white p-4"><h3 className="font-bold text-lg">{ins.formations?.title}</h3></div><div className="p-5"><p className="text-gray-600 text-sm">{ins.formations?.description}</p><p className="text-xs text-gray-400 mt-3">Inscrit le {new Date(ins.created_at).toLocaleDateString()}</p></div></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EspaceParticipant;