// frontend/src/pages/EspaceParticipant.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const EspaceParticipant = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [myFormations, setMyFormations] = useState([]);
  const [pendingFormations, setPendingFormations] = useState([]);
  const [upcomingSeances, setUpcomingSeances] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchMyFormations = async () => {
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, formations:formation_id (id, title, description, duration, is_online)`)
        .eq("user_id", user.id)
        .eq("statut", "confirme");
      if (error) throw error;
      setMyFormations(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchPendingFormations = async () => {
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, formations:formation_id (id, title, description, duration, is_online)`)
        .eq("user_id", user.id)
        .eq("statut", "en_attente");
      if (error) throw error;
      setPendingFormations(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchUpcomingSeances = async () => {
    try {
      const { data: inscriptions, error: insError } = await supabase
        .from("inscriptions")
        .select("id, formation_id, groupe_id")
        .eq("user_id", user.id)
        .eq("statut", "confirme");
      if (insError) throw insError;
      if (!inscriptions.length) { setUpcomingSeances([]); return; }

      const groupeIds = inscriptions.map(i => i.groupe_id).filter(Boolean);
      if (!groupeIds.length) { setUpcomingSeances([]); return; }

      const { data: assignments, error: assError } = await supabase
        .from("formateur_assignments")
        .select("id, formation_id, groupe_nom")
        .in("groupe_id", groupeIds);
      if (assError) throw assError;

      const assignmentIds = assignments.map(a => a.id);
      const { data: seances, error: seaError } = await supabase
        .from("seances")
        .select("*")
        .in("assignment_id", assignmentIds)
        .not("lien_reunion", "is", null)
        .gte("date_seance", new Date().toISOString())
        .order("date_seance", { ascending: true });
      if (seaError) throw seaError;

      const seancesAvecInfos = seances.map(seance => {
        const assignment = assignments.find(a => a.id === seance.assignment_id);
        const inscription = inscriptions.find(i => i.groupe_id === assignment?.groupe_id);
        const formation = myFormations.find(f => f.formation_id === inscription?.formation_id);
        return { ...seance, formation_id: inscription?.formation_id, formation_titre: formation?.formations?.title || "Formation", lien_reunion: seance.lien_reunion, date_seance: seance.date_seance, titre: seance.titre, duree: seance.duree, lien_partage_le: seance.lien_partage_le };
      });
      setUpcomingSeances(seancesAvecInfos);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try { await Promise.all([fetchMyFormations(), fetchPendingFormations(), fetchUpcomingSeances()]); }
    catch (err) { console.error(err); }
    finally { setLoadingData(false); }
  };

  // Real-time subscription pour les séances
  useEffect(() => {
    if (user && userType === "participant" && isApproved) {
      fetchData();
      const subscription = supabase
        .channel('seances_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seances' }, () => fetchUpcomingSeances())
        .subscribe();
      return () => { subscription.unsubscribe(); };
    }
  }, [user, userType, isApproved]);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/connexion");
      else if (userType !== "participant") { toast.error("Accès réservé aux participants"); navigate("/"); }
      else if (!isApproved) toast.warning("⏳ Votre compte est en attente d'approbation");
    }
  }, [user, userType, isApproved, loading, navigate]);

  const rejoindreReunion = (lien) => { if (lien) { window.open(lien, "_blank"); toast.success("Ouverture de la salle de classe..."); } else toast.error("Lien de réunion non disponible"); };

  if (loading || loadingData) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;
  if (!user || userType !== "participant") return null;

  return (
    <>
      <Helmet><title>Espace Participant | Centre Certus</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8"><h1 className="text-3xl font-bold">👋 Espace Participant</h1><p className="text-blue-100 mt-1">Bienvenue, {user?.user_metadata?.full_name || user?.email}</p></div>

          {pendingFormations.length > 0 && (<div className="mb-10"><h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-yellow-600">⏳</span> Inscriptions en attente</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{pendingFormations.map(ins => (<div key={ins.id} className="bg-yellow-50 rounded-xl shadow-md overflow-hidden border border-yellow-200"><div className="bg-yellow-100 p-4"><h3 className="font-bold text-lg text-yellow-800">{ins.formations?.title}</h3></div><div className="p-5"><p className="text-gray-600 text-sm mb-3 line-clamp-2">{ins.formations?.description}</p><div className="bg-yellow-100 rounded-lg p-3 text-center"><p className="text-yellow-700 text-sm font-medium flex items-center justify-center gap-2"><span>⏳</span> En attente de validation par l'administrateur</p></div></div></div>))}</div></div>)}

          <div className="mb-10"><h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-green-600">🎥</span> Vos réunions à venir</h2>{upcomingSeances.length === 0 ? (<div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200"><div className="text-5xl mb-3">🎬</div><h3 className="text-lg font-medium text-gray-700">Aucune réunion programmée</h3><p className="text-gray-500 text-sm mt-1">Les liens de réunion apparaîtront ici dès que votre formateur les partagera.</p></div>) : (<div className="space-y-4">{upcomingSeances.map(seance => (<div key={seance.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"><div className="p-5"><div className="flex justify-between items-start flex-wrap gap-3"><div className="flex-1"><div className="flex items-center gap-2 mb-2 flex-wrap"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{seance.formation_titre}</span><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">🟢 À venir</span></div><h3 className="text-lg font-bold text-gray-800">{seance.titre}</h3><div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap"><span className="flex items-center gap-1">📅 {new Date(seance.date_seance).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><span className="flex items-center gap-1">⏰ {new Date(seance.date_seance).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span><span className="flex items-center gap-1">⏱️ {seance.duree} min</span></div>{seance.lien_partage_le && new Date(seance.lien_partage_le) > new Date(Date.now() - 5 * 60 * 1000) && (<div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 inline-block"><p className="text-xs text-green-700 flex items-center gap-1">🆕 Le lien vient d'être partagé par votre formateur !</p></div>)}</div><button onClick={() => rejoindreReunion(seance.lien_reunion)} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"><span className="text-lg">🎥</span>Rejoindre la réunion<span>→</span></button></div></div></div>))}</div>)}</div>

          <div><h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="text-blue-600">✅</span> Mes formations confirmées</h2>{myFormations.length === 0 ? (<div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200"><p className="text-gray-500">Vous n'avez aucune formation confirmée.</p><Link to="/formations" className="mt-3 inline-block text-[#1a56db] hover:underline">Découvrir les formations →</Link></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{myFormations.map(ins => (<div key={ins.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"><div className="bg-gray-800 text-white p-4"><h3 className="font-bold text-lg">{ins.formations?.title}</h3>{ins.formations?.is_online && <span className="inline-block mt-1 text-xs bg-green-500 px-2 py-0.5 rounded-full">🌍 En ligne</span>}</div><div className="p-5"><p className="text-gray-600 text-sm line-clamp-3">{ins.formations?.description}</p><p className="text-xs text-gray-400 mt-3">Inscrit le {new Date(ins.created_at).toLocaleDateString()}</p>{ins.formations?.is_online && (<div className="mt-3 pt-3 border-t border-gray-100"><p className="text-xs text-green-600 flex items-center gap-1"><span>✅</span> Formation en ligne - Sessions à venir</p></div>)}</div></div>))}</div>)}</div>
        </div>
      </div>
    </>
  );
};

export default EspaceParticipant;