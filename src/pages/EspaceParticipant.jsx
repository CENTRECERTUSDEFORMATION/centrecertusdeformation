// frontend/src/pages/EspaceParticipant.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

const EspaceParticipant = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [myFormations, setMyFormations] = useState([]);
  const [pendingFormations, setPendingFormations] = useState([]);
  const [upcomingSeances, setUpcomingSeances] = useState([]);
  const [pastSeances, setPastSeances] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalSeances: 0,
    totalHeures: 0,
    prochainSeance: null,
    totalTests: 0
  });

  const fetchInProgress = useRef(false);

  // ============================================
  // FORMATAGE
  // ============================================
  const formatDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "";
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  const formatRelativeTime = (date) => {
    if (!date) return "";
    try {
      const now = new Date();
      const diff = new Date(date) - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Aujourd'hui";
      if (days === 1) return "Demain";
      if (days < 0) return "Passé";
      return `Dans ${days} jours`;
    } catch {
      return "";
    }
  };

  // ============================================
  // ✅ AFFICHAGE DU TITRE DU TEST
  // ============================================
  const getTestTitle = (result) => {
    if (result.formations?.title) {
      return result.formations.title;
    }
    const testTypeLabels = {
      'excelDebutant': 'Test Excel Débutant',
      'excelAvance': 'Test Excel Avancé',
      'excelAvancé': 'Test Excel Avancé',
      'langues': 'Test de Langues',
      'anglais': 'Test d\'Anglais',
      'allemand': 'Test d\'Allemand',
      'espagnol': 'Test d\'Espagnol',
      'francais': 'Test de Français',
      'italien': 'Test d\'Italien'
    };
    return testTypeLabels[result.test_type] 
      || (result.test_type ? `Test ${result.test_type}` : 'Test de niveau');
  };

  // ============================================
  // ✅ LIEN VERS LA FORMATION
  // ============================================
  const getFormationLink = (result) => {
    if (result.formations?.slug) {
      return `/formations/${result.formations.slug}`;
    }
    if (result.test_type === 'excelDebutant') {
      return '/formations/excel-debutant-les-fondamentaux';
    }
    if (result.test_type === 'excelAvance' || result.test_type === 'excelAvancé') {
      return '/formations/excel-avance-formation-perfectionnement-et-automatisation-ce';
    }
    return '/formations?search=excel';
  };

  // ============================================
  // ✅ LIEN POUR REFAIRE LE TEST
  // ============================================
  const getRetryTestLink = (result) => {
    if (result.test_type === 'excelDebutant') {
      return '/test/excel-debutant';
    }
    if (result.test_type === 'excelAvance' || result.test_type === 'excelAvancé') {
      return '/test/excel-avance';
    }
    return null;
  };

  // ============================================
  // FETCH DONNÉES
  // ============================================
  const fetchMyFormations = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, formations:formation_id (id, title, description, duration, is_online, onDemand, theme, price, images)`)
        .eq("user_id", user.id)
        .eq("statut", "confirme");
      if (error) throw error;
      return data || [];
    } catch (err) { 
      console.error("Erreur fetch formations:", err); 
      return [];
    }
  }, [user?.id]);

  const fetchPendingFormations = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, formations:formation_id (id, title, description, duration, is_online, onDemand, theme, price)`)
        .eq("user_id", user.id)
        .eq("statut", "en_attente");
      if (error) throw error;
      return data || [];
    } catch (err) { 
      console.error("Erreur fetch pending:", err); 
      return [];
    }
  }, [user?.id]);

  // ✅ FETCH TEST RESULTS - avec logs détaillés
  const fetchTestResults = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ fetchTestResults: pas d\'user');
      return [];
    }
    
    try {
      console.log('🔍 fetchTestResults pour user:', user.id);
      
      const { data, error } = await supabase
        .from('test_results')
        .select('*, formations:formation_id(id, title, slug)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur Supabase test_results:', error);
        throw error;
      }
      
      console.log('📊 Test results récupérés:', data);
      console.log('📊 Nombre:', data?.length || 0);
      
      return data || [];
    } catch (err) {
      console.error("❌ Erreur fetch test results:", err);
      return [];
    }
  }, [user?.id]);

  const fetchSeances = useCallback(async () => {
    if (!user?.id) return { upcoming: [], past: [] };
    try {
      const { data: inscriptions, error: insError } = await supabase
        .from("inscriptions")
        .select("id, formation_id, groupe_id")
        .eq("user_id", user.id)
        .eq("statut", "confirme");
      if (insError) throw insError;
      if (!inscriptions || inscriptions.length === 0) return { upcoming: [], past: [] };

      const groupeIds = inscriptions.map(i => i.groupe_id).filter(Boolean);
      if (!groupeIds.length) return { upcoming: [], past: [] };

      const { data: assignments, error: assError } = await supabase
        .from("formateur_assignments")
        .select("id, formation_id, groupe_nom")
        .in("groupe_id", groupeIds);
      if (assError) throw assError;
      if (!assignments || assignments.length === 0) return { upcoming: [], past: [] };

      const assignmentIds = assignments.map(a => a.id);
      const { data: seances, error: seaError } = await supabase
        .from("seances")
        .select("*")
        .in("assignment_id", assignmentIds)
        .order("date_seance", { ascending: true });
      if (seaError) throw seaError;
      if (!seances) return { upcoming: [], past: [] };

      const formationIds = [...new Set(inscriptions.map(i => i.formation_id).filter(Boolean))];
      let formationsMap = {};
      if (formationIds.length > 0) {
        const { data: formationsData } = await supabase
          .from("formations")
          .select("id, title, images")
          .in("id", formationIds);
        formationsData?.forEach(f => { 
          formationsMap[f.id] = { 
            title: f.title,
            images: f.images || []
          }; 
        });
      }

      const now = new Date();
      const upcoming = [];
      const past = [];

      seances.forEach(seance => {
        const assignment = assignments.find(a => a.id === seance.assignment_id);
        const inscription = inscriptions.find(i => i.groupe_id === assignment?.groupe_id);
        const formationInfo = formationsMap[inscription?.formation_id] || { title: "Formation", images: [] };
        const seanceDate = new Date(seance.date_seance);
        
        const seanceData = { 
          ...seance, 
          formation_id: inscription?.formation_id, 
          formation_titre: formationInfo.title,
          formation_images: formationInfo.images,
          lien_reunion: seance.lien_reunion, 
          date_seance: seance.date_seance, 
          titre: seance.titre, 
          duree: seance.duree, 
          lien_partage_le: seance.lien_partage_le,
          description: seance.description || "",
          isPast: seanceDate < now
        };

        if (seanceDate < now) {
          past.push(seanceData);
        } else {
          upcoming.push(seanceData);
        }
      });

      return { 
        upcoming: upcoming.sort((a, b) => new Date(a.date_seance) - new Date(b.date_seance)),
        past: past.sort((a, b) => new Date(b.date_seance) - new Date(a.date_seance))
      };
    } catch (err) { 
      console.error("Erreur fetch seances:", err); 
      return { upcoming: [], past: [] };
    }
  }, [user?.id]);

  const fetchAllData = useCallback(async () => {
    if (fetchInProgress.current || !user?.id || !isApproved) {
      console.log('⚠️ fetchAllData annulé:', {
        inProgress: fetchInProgress.current,
        hasUser: !!user?.id,
        isApproved
      });
      return;
    }
    
    fetchInProgress.current = true;
    setLoadingData(true);
    
    console.log('🔄 fetchAllData - Début pour:', user.email);
    
    try {
      const [formations, pending, seancesData, testResultsData] = await Promise.all([
        fetchMyFormations(),
        fetchPendingFormations(),
        fetchSeances(),
        fetchTestResults()
      ]);
      
      console.log('✅ fetchAllData - Résultats:', {
        formations: formations?.length || 0,
        pending: pending?.length || 0,
        upcomingSeances: seancesData?.upcoming?.length || 0,
        pastSeances: seancesData?.past?.length || 0,
        testResults: testResultsData?.length || 0
      });
      
      setMyFormations(formations || []);
      setPendingFormations(pending || []);
      setUpcomingSeances(seancesData?.upcoming || []);
      setPastSeances(seancesData?.past || []);
      setTestResults(testResultsData || []);
      
      const totalFormations = formations?.length || 0;
      const totalSeances = (seancesData?.upcoming?.length || 0) + (seancesData?.past?.length || 0);
      const totalHeures = (seancesData?.upcoming?.reduce((acc, s) => acc + (s.duree || 0), 0) || 0) + 
                          (seancesData?.past?.reduce((acc, s) => acc + (s.duree || 0), 0) || 0);
      const prochainSeance = seancesData?.upcoming?.length > 0 ? seancesData.upcoming[0] : null;
      
      setStats({
        totalFormations,
        totalSeances,
        totalHeures,
        prochainSeance,
        totalTests: testResultsData?.length || 0
      });
      
      setDataFetched(true);
    } catch (err) {
      console.error("❌ Erreur chargement données:", err);
      toast.error("Erreur chargement des données");
    } finally {
      setLoadingData(false);
      fetchInProgress.current = false;
      console.log('🏁 fetchAllData - Fin');
    }
  }, [user?.id, user?.email, isApproved, fetchMyFormations, fetchPendingFormations, fetchSeances, fetchTestResults]);

  const rejoindreReunion = useCallback((lien) => {
    if (lien) { 
      window.open(lien, "_blank"); 
      toast.success("Ouverture de la salle de classe..."); 
    } else {
      toast.error("Lien de réunion non disponible");
    }
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  // ============================================
  // ✅ CHARGEMENT INITIAL - Re-fetch si user change
  // ============================================
  useEffect(() => {
    // Réinitialiser dataFetched si l'utilisateur change
    if (user?.id) {
      setDataFetched(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && isApproved && !dataFetched && !loading) {
      console.log('🚀 Déclenchement fetchAllData');
      fetchAllData();
    }
  }, [user, isApproved, dataFetched, loading, fetchAllData]);

  // ============================================
  // ✅ REAL-TIME SUBSCRIPTION (seances + test_results)
  // ============================================
  useEffect(() => {
    if (!user || !isApproved) return;
    
    const subscription = supabase
      .channel('seances_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seances' }, 
        () => {
          fetchSeances().then(({ upcoming, past }) => {
            setUpcomingSeances(upcoming || []);
            setPastSeances(past || []);
          });
        }
      )
      .subscribe();

    const testSubscription = supabase
      .channel('test_results_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'test_results', filter: `user_id=eq.${user.id}` },
        () => {
          console.log('🔄 Test result changé, re-fetch...');
          fetchTestResults().then(setTestResults);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      testSubscription.unsubscribe();
    };
  }, [user, isApproved, fetchSeances, fetchTestResults]);

  // ============================================
  // ✅ VÉRIFICATION ACCÈS - Autoriser admin aussi
  // ============================================
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/connexion");
      } else if (userType && !['participant', 'admin', 'formateur'].includes(userType)) {
        toast.error("Accès non autorisé");
        navigate("/");
      } else if (!isApproved) {
        toast.warning("⏳ Votre compte est en attente d'approbation");
      }
    }
  }, [user, userType, isApproved, loading, navigate]);

  // ============================================
  // LOADING
  // ============================================
  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]" aria-label="Chargement en cours"></div>
      </div>
    );
  }
  
  if (!user) return null;

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Helmet>
        <title>Espace Participant | Centre Certus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20"
      >
        <div className="max-w-7xl mx-auto p-6">
          
          {/* En-tête */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "👤"}</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">👋 Bonjour, {user?.user_metadata?.full_name || user?.email}</h1>
                    <p className="text-blue-100 text-sm">Espace participant • {user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <span>✅</span> Compte validé
                </span>
              </div>
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalFormations}</p>
                  <p className="text-xs text-gray-500">Formations</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-2xl">🎥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalSeances}</p>
                  <p className="text-xs text-gray-500">Séances totales</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalHeures}h</p>
                  <p className="text-xs text-gray-500">Heures de formation</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.prochainSeance ? formatRelativeTime(stats.prochainSeance.date_seance) : "—"}
                  </p>
                  <p className="text-xs text-gray-500">Prochaine séance</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <span className="text-2xl">🧪</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalTests}</p>
                  <p className="text-xs text-gray-500">Tests effectués</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inscriptions en attente */}
          <AnimatePresence>
            {pendingFormations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-yellow-600">⏳</span> Inscriptions en attente
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{pendingFormations.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingFormations.map(ins => (
                    <motion.div 
                      key={ins.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-yellow-50 rounded-xl shadow-sm overflow-hidden border border-yellow-200 hover:shadow-md transition"
                    >
                      <div className="bg-yellow-100 p-4">
                        <h3 className="font-bold text-yellow-800 truncate">{ins.formations?.title}</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm line-clamp-2">{ins.formations?.description}</p>
                        <div className="mt-3 bg-yellow-100 rounded-lg p-3 text-center">
                          <p className="text-yellow-700 text-sm font-medium flex items-center justify-center gap-2">
                            <span className="animate-pulse">⏳</span> En attente de validation
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Demandé le {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Séances */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-green-600">🎥</span> Mes séances
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {upcomingSeances.length} à venir
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "upcoming" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  🟢 À venir ({upcomingSeances.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "past" 
                      ? "bg-gray-600 text-white" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  ⏮️ Passées ({pastSeances.length})
                </button>
              </div>
            </div>

            {/* Séances à venir */}
            {activeTab === "upcoming" && (
              <AnimatePresence>
                {upcomingSeances.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200"
                  >
                    <div className="text-5xl mb-3">🎬</div>
                    <h3 className="text-lg font-medium text-gray-700">Aucune réunion programmée</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Les liens de réunion apparaîtront ici dès que votre formateur les partagera.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSeances.map((seance, index) => (
                      <motion.div 
                        key={seance.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="p-5">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                  {seance.formation_titre}
                                </span>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  À venir
                                </span>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                  {formatRelativeTime(seance.date_seance)}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-800 truncate">{seance.titre}</h3>
                              {seance.description && (
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{seance.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  📅 {formatDate(seance.date_seance)}
                                </span>
                                <span className="flex items-center gap-1">
                                  ⏰ {formatTime(seance.date_seance)}
                                </span>
                                <span className="flex items-center gap-1">
                                  ⏱️ {seance.duree} min
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => seance.lien_reunion ? rejoindreReunion(seance.lien_reunion) : toast.error("Lien de réunion non disponible")} 
                              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg ${
                                seance.lien_reunion 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={!seance.lien_reunion}
                            >
                              <span className="text-lg">🎥</span>
                              {seance.lien_reunion ? "Rejoindre" : "En attente"}
                              {seance.lien_reunion && <span>→</span>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}

            {/* Séances passées */}
            {activeTab === "past" && (
              <AnimatePresence>
                {pastSeances.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200"
                  >
                    <div className="text-5xl mb-3">📅</div>
                    <h3 className="text-lg font-medium text-gray-700">Aucune séance passée</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Vos séances terminées apparaîtront ici.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {pastSeances.map((seance, index) => (
                      <motion.div 
                        key={seance.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-75 hover:opacity-100 transition"
                      >
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                  {seance.formation_titre}
                                </span>
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                  ✅ Terminée
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-800 truncate">{seance.titre}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                                <span>📅 {formatDate(seance.date_seance)}</span>
                                <span>⏰ {formatTime(seance.date_seance)}</span>
                                <span>⏱️ {seance.duree} min</span>
                              </div>
                            </div>
                            {seance.lien_reunion && (
                              <button 
                                onClick={() => rejoindreReunion(seance.lien_reunion)} 
                                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition flex items-center gap-1"
                              >
                                📹 Voir le replay
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* ✅ Résultats des tests - AVEC MESSAGE SI VIDE */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-600">🧪</span> Mes résultats de tests
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{testResults.length}</span>
            </h2>
            
            {testResults.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="text-5xl mb-3">📝</div>
                <h3 className="text-lg font-medium text-gray-700">Aucun test effectué</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Passez un test de niveau gratuit pour découvrir votre profil.
                </p>
                <Link 
                  to="/formations?search=excel" 
                  className="inline-block bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
                >
                  🧪 Voir les tests disponibles
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => {
                  const levelColors = {
                    'Avancé': 'bg-green-100 text-green-700 border-green-200',
                    'Expert': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'Intermédiaire': 'bg-orange-100 text-orange-700 border-orange-200',
                    'Débutant': 'bg-blue-100 text-blue-700 border-blue-200'
                  };
                  const levelEmojis = {
                    'Avancé': '🏆',
                    'Expert': '👑',
                    'Intermédiaire': '📊',
                    'Débutant': '📚'
                  };
                  
                  const testTitle = getTestTitle(result);
                  const formationLink = getFormationLink(result);
                  const retryLink = getRetryTestLink(result);
                  
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800">
                              {testTitle}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelColors[result.level] || 'bg-gray-100 text-gray-700'}`}>
                              {levelEmojis[result.level] || '📚'} {result.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                            <span>✅ {result.score}/{result.total_questions} bonnes réponses</span>
                            <span>🎯 {result.percentage}%</span>
                            <span>⏱️ {Math.floor(result.time_spent / 60)}:{String(result.time_spent % 60).padStart(2, '0')}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Test effectué le {new Date(result.created_at).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          {retryLink && (
                            <Link
                              to={retryLink}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition whitespace-nowrap"
                            >
                              🔄 Refaire
                            </Link>
                          )}
                          <Link
                            to={formationLink}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                          >
                            Voir la formation →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formations confirmées */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">✅</span> Mes formations confirmées
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{myFormations.length}</span>
            </h2>
            
            {myFormations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-gray-500">Vous n'avez aucune formation confirmée.</p>
                <Link 
                  to="/formations" 
                  className="mt-3 inline-block text-[#1a56db] hover:underline font-medium"
                >
                  Découvrir les formations →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFormations.map(ins => (
                  <motion.div 
                    key={ins.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition group"
                  >
                    {ins.formations?.images && ins.formations.images.length > 0 && (
                      <div className="h-32 bg-gray-100 overflow-hidden">
                        <img 
                          src={getImageUrl(ins.formations.images[0])} 
                          alt={ins.formations.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 truncate">{ins.formations?.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mt-1">{ins.formations?.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ins.formations?.is_online && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🌍 En ligne</span>
                        )}
                        {ins.formations?.onDemand && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🏢 Présentiel</span>
                        )}
                        {ins.formations?.theme && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {ins.formations.theme}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Inscrit le {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Vous souhaitez découvrir d'autres formations ? 
              <Link to="/formations" className="text-[#1a56db] font-medium hover:underline ml-1">
                Voir toutes les formations →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EspaceParticipant;