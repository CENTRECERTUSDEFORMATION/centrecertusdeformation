// frontend/src/pages/EspaceParticipant.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// CONSTANTES
// ============================================
const TEST_TYPES_VALIDES = [
  'excelDebutant', 'excelAvance', 'excelAvancé',
  'langues', 'anglais', 'allemand', 'espagnol',
  'francais', 'italien'
];

const LEVEL_CONFIG = {
  'Débutant': {
    color: '#3b82f6',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    emoji: '📚'
  },
  'Intermédiaire': {
    color: '#f59e0b',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    emoji: '📊'
  },
  'Avancé': {
    color: '#10b981',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
    emoji: '🏆'
  },
  'Expert': {
    color: '#eab308',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600',
    emoji: '👑'
  }
};

const EspaceParticipant = () => {
  const { user, userType, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  // États
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
    totalTests: 0,
    meilleurScore: 0,
    moyenneScore: 0
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

  const formatDateShort = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
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
      if (days <= 7) return `Dans ${days} jours`;
      return `Dans ${Math.floor(days / 7)} sem.`;
    } catch {
      return "";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  // ============================================
  // HELPERS
  // ============================================
  const getTestTitle = useCallback((result) => {
    if (result.formations?.title) return result.formations.title;
    
    const labels = {
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
    
    return labels[result.test_type] || 
           (result.test_type ? `Test ${result.test_type}` : 'Test de niveau');
  }, []);

  const getFormationLink = useCallback((result) => {
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
  }, []);

  const getRetryTestLink = useCallback((result) => {
    if (result.test_type === 'excelDebutant') return '/test/excel-debutant';
    if (result.test_type === 'excelAvance' || result.test_type === 'excelAvancé') return '/test/excel-avance';
    return null;
  }, []);

  const getImageUrl = useCallback((path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  }, []);

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

  // ✅ FETCH TEST RESULTS avec filtre des tests de débogage
  const fetchTestResults = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*, formations:formation_id(id, title, slug)')
        .eq('user_id', user.id)
        .in('test_type', TEST_TYPES_VALIDES) // ✅ Filtre les tests de débogage
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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
      if (!inscriptions?.length) return { upcoming: [], past: [] };

      const groupeIds = inscriptions.map(i => i.groupe_id).filter(Boolean);
      if (!groupeIds.length) return { upcoming: [], past: [] };

      const { data: assignments, error: assError } = await supabase
        .from("formateur_assignments")
        .select("id, formation_id, groupe_nom")
        .in("groupe_id", groupeIds);
      if (assError) throw assError;
      if (!assignments?.length) return { upcoming: [], past: [] };

      const assignmentIds = assignments.map(a => a.id);
      const { data: seances, error: seaError } = await supabase
        .from("seances")
        .select("*")
        .in("assignment_id", assignmentIds)
        .order("date_seance", { ascending: true });
      if (seaError) throw seaError;
      if (!seances) return { upcoming: [], past: [] };

      const formationIds = [...new Set(inscriptions.map(i => i.formation_id).filter(Boolean))];
      const formationsMap = {};
      if (formationIds.length) {
        const { data: formationsData } = await supabase
          .from("formations")
          .select("id, title, images")
          .in("id", formationIds);
        formationsData?.forEach(f => {
          formationsMap[f.id] = { title: f.title, images: f.images || [] };
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
          isPast: seanceDate < now
        };

        if (seanceDate < now) past.push(seanceData);
        else upcoming.push(seanceData);
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
    if (fetchInProgress.current || !user?.id || !isApproved) return;
    fetchInProgress.current = true;
    setLoadingData(true);

    try {
      const [formations, pending, seancesData, testResultsData] = await Promise.all([
        fetchMyFormations(),
        fetchPendingFormations(),
        fetchSeances(),
        fetchTestResults()
      ]);

      setMyFormations(formations || []);
      setPendingFormations(pending || []);
      setUpcomingSeances(seancesData?.upcoming || []);
      setPastSeances(seancesData?.past || []);
      setTestResults(testResultsData || []);

      // Calcul des statistiques avancées
      const totalFormations = formations?.length || 0;
      const totalSeances = (seancesData?.upcoming?.length || 0) + (seancesData?.past?.length || 0);
      const totalHeures = Math.round(
        ((seancesData?.upcoming?.reduce((acc, s) => acc + (s.duree || 0), 0) || 0) +
         (seancesData?.past?.reduce((acc, s) => acc + (s.duree || 0), 0) || 0)) / 60
      );
      const prochainSeance = seancesData?.upcoming?.[0] || null;

      // Stats sur les tests
      const scores = testResultsData?.map(t => t.percentage) || [];
      const meilleurScore = scores.length ? Math.max(...scores) : 0;
      const moyenneScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      setStats({
        totalFormations,
        totalSeances,
        totalHeures,
        prochainSeance,
        totalTests: testResultsData?.length || 0,
        meilleurScore,
        moyenneScore
      });

      setDataFetched(true);
    } catch (err) {
      console.error("❌ Erreur chargement données:", err);
      toast.error("Erreur chargement des données");
    } finally {
      setLoadingData(false);
      fetchInProgress.current = false;
    }
  }, [user?.id, isApproved, fetchMyFormations, fetchPendingFormations, fetchSeances, fetchTestResults]);

  const rejoindreReunion = useCallback((lien) => {
    if (lien) {
      window.open(lien, "_blank");
      toast.success("Ouverture de la salle de classe...");
    } else {
      toast.error("Lien de réunion non disponible");
    }
  }, []);

  // ============================================
  // EFFETS
  // ============================================
  useEffect(() => {
    if (user?.id) setDataFetched(false);
  }, [user?.id]);

  useEffect(() => {
    if (user && isApproved && !dataFetched && !loading) {
      fetchAllData();
    }
  }, [user, isApproved, dataFetched, loading, fetchAllData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !isApproved) return;

    const subscription = supabase
      .channel('seances_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seances' }, () => {
        fetchSeances().then(({ upcoming, past }) => {
          setUpcomingSeances(upcoming || []);
          setPastSeances(past || []);
        });
      })
      .subscribe();

    const testSubscription = supabase
      .channel('test_results_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'test_results', filter: `user_id=eq.${user.id}` },
        () => fetchTestResults().then(setTestResults)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      testSubscription.unsubscribe();
    };
  }, [user, isApproved, fetchSeances, fetchTestResults]);

  // Vérification accès
  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/connexion");
      else if (userType && !['participant', 'admin', 'formateur'].includes(userType)) {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#1a56db] border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600 font-medium">Chargement de votre espace...</p>
        </div>
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
        <title>Mon espace | Centre Certus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ============================================
              EN-TÊTE HERO
              ============================================ */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-gradient-to-r from-[#1a56db] via-indigo-600 to-[#76c21f] text-white rounded-3xl p-8 mb-8 shadow-2xl overflow-hidden"
          >
            {/* Décorations */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg ring-4 ring-white/20"
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span>{user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "👤"}</span>
                  )}
                </motion.div>
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Bienvenue 👋</p>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </h1>
                  <p className="text-blue-100 text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Compte actif
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-sm">
                  🎓 Participant
                </span>
              </div>
            </div>
          </motion.div>

          {/* ============================================
              STATISTIQUES
              ============================================ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            <StatCard icon="📚" label="Formations" value={stats.totalFormations} color="blue" />
            <StatCard icon="🎥" label="Séances" value={stats.totalSeances} color="green" />
            <StatCard icon="⏱️" label="Heures" value={`${stats.totalHeures}h`} color="purple" />
            <StatCard icon="🧪" label="Tests" value={stats.totalTests} color="indigo" />
            <StatCard icon="🎯" label="Meilleur" value={`${stats.meilleurScore}%`} color="emerald" />
            <StatCard
              icon="📅"
              label="Prochaine"
              value={stats.prochainSeance ? formatRelativeTime(stats.prochainSeance.date_seance) : "—"}
              color="orange"
            />
          </motion.div>

          {/* ============================================
              PROCHAINE SÉANCE (MISE EN AVANT)
              ============================================ */}
          {stats.prochainSeance && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                      📅
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">
                        Prochaine séance
                      </p>
                      <h3 className="text-xl font-bold mb-1">{stats.prochainSeance.titre}</h3>
                      <p className="text-blue-100 text-sm">
                        {stats.prochainSeance.formation_titre} • {formatDate(stats.prochainSeance.date_seance)} à {formatTime(stats.prochainSeance.date_seance)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => rejoindreReunion(stats.prochainSeance.lien_reunion)}
                    disabled={!stats.prochainSeance.lien_reunion}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    🎥 Rejoindre
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================
              INSCRIPTIONS EN ATTENTE
              ============================================ */}
          <AnimatePresence>
            {pendingFormations.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <SectionTitle
                  icon="⏳"
                  title="Inscriptions en attente"
                  count={pendingFormations.length}
                  color="yellow"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingFormations.map((ins, idx) => (
                    <motion.div
                      key={ins.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-yellow-200 hover:shadow-lg transition"
                    >
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-400 p-4">
                        <h3 className="font-bold text-white truncate">
                          {ins.formations?.title}
                        </h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {ins.formations?.description}
                        </p>
                        <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
                          <p className="text-yellow-700 text-sm font-semibold flex items-center justify-center gap-2">
                            <span className="animate-pulse">⏳</span>
                            En attente de validation
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                          Demandé le {formatDateShort(ins.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ============================================
              RÉSULTATS DE TESTS
              ============================================ */}
          <section className="mb-8">
            <SectionTitle
              icon="🧪"
              title="Mes résultats de tests"
              count={testResults.length}
              color="purple"
            />

            {testResults.length === 0 ? (
              <EmptyState
                icon="📝"
                title="Aucun test effectué"
                description="Passez un test de niveau gratuit pour découvrir votre profil et obtenir une recommandation personnalisée."
                actionLabel="🧪 Voir les tests disponibles"
                actionLink="/formations?search=excel"
                color="purple"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {testResults.map((result, index) => {
                  const levelConf = LEVEL_CONFIG[result.level] || LEVEL_CONFIG['Débutant'];
                  const testTitle = getTestTitle(result);
                  const formationLink = getFormationLink(result);
                  const retryLink = getRetryTestLink(result);

                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                    >
                      {/* Header avec niveau */}
                      <div className={`bg-gradient-to-r ${levelConf.gradient} p-4 text-white`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-3xl">{levelConf.emoji}</span>
                            <div className="min-w-0">
                              <h3 className="font-bold truncate">{testTitle}</h3>
                              <p className="text-white/80 text-xs">
                                {formatDateShort(result.created_at)}
                              </p>
                            </div>
                          </div>
                          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                            {result.level}
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-5">
                        {/* Score visuel */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                              <motion.circle
                                cx="40" cy="40" r="32"
                                stroke={levelConf.color}
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 32}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - result.percentage / 100) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-bold text-gray-800">
                                {result.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <StatMini
                              icon="✅"
                              label="Score"
                              value={`${result.score}/${result.total_questions}`}
                            />
                            <StatMini
                              icon="⏱️"
                              label="Temps"
                              value={formatDuration(result.time_spent)}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          {retryLink && (
                            <Link
                              to={retryLink}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                            >
                              🔄 Refaire
                            </Link>
                          )}
                          <Link
                            to={formationLink}
                            className="flex-1 bg-gradient-to-r from-[#1a56db] to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
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
          </section>

          {/* ============================================
              SÉANCES
              ============================================ */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <SectionTitle
                icon="🎥"
                title="Mes séances"
                count={upcomingSeances.length}
                color="green"
                noMargin
              />

              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "upcoming"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  🟢 À venir ({upcomingSeances.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "past"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ⏮️ Passées ({pastSeances.length})
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "upcoming" ? (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {upcomingSeances.length === 0 ? (
                    <EmptyState
                      icon="🎬"
                      title="Aucune réunion programmée"
                      description="Les liens de réunion apparaîtront ici dès que votre formateur les partagera."
                      color="blue"
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcomingSeances.map((seance, index) => (
                        <SeanceCard
                          key={seance.id}
                          seance={seance}
                          index={index}
                          onJoin={() => rejoindreReunion(seance.lien_reunion)}
                          formatDate={formatDate}
                          formatTime={formatTime}
                          formatRelativeTime={formatRelativeTime}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="past"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {pastSeances.length === 0 ? (
                    <EmptyState
                      icon="📅"
                      title="Aucune séance passée"
                      description="Vos séances terminées apparaîtront ici."
                      color="gray"
                    />
                  ) : (
                    <div className="space-y-3">
                      {pastSeances.map((seance, index) => (
                        <PastSeanceCard
                          key={seance.id}
                          seance={seance}
                          index={index}
                          onJoin={() => rejoindreReunion(seance.lien_reunion)}
                          formatDate={formatDate}
                          formatTime={formatTime}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ============================================
              FORMATIONS CONFIRMÉES
              ============================================ */}
          <section>
            <SectionTitle
              icon="✅"
              title="Mes formations confirmées"
              count={myFormations.length}
              color="blue"
            />

            {myFormations.length === 0 ? (
              <EmptyState
                icon="📚"
                title="Aucune formation confirmée"
                description="Découvrez nos formations et inscrivez-vous pour commencer votre parcours."
                actionLabel="Découvrir les formations →"
                actionLink="/formations"
                color="blue"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFormations.map((ins, index) => (
                  <FormationCard
                    key={ins.id}
                    formation={ins}
                    index={index}
                    getImageUrl={getImageUrl}
                    formatDate={formatDateShort}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ============================================
              FOOTER
              ============================================ */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Besoin d'aide ?{" "}
              <Link to="/contact" className="text-[#1a56db] font-semibold hover:underline">
                Contactez-nous →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// SOUS-COMPOSANTS RÉUTILISABLES
// ============================================

// Section Title
const SectionTitle = ({ icon, title, count, color = "blue", noMargin = false }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
    indigo: "from-indigo-500 to-indigo-600"
  };

  return (
    <div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-5'}`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-lg shadow-md`}>
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
        {count}
      </span>
    </div>
  );
};

// Stat Card
const StatCard = ({ icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
          <p className="text-xs text-gray-500 truncate">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Mini (dans les cartes de test)
const StatMini = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-2 text-center">
    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
  </div>
);

// Empty State
const EmptyState = ({ icon, title, description, actionLabel, actionLink, color = "gray" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    gray: "from-gray-500 to-gray-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-200"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className={`inline-block bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all`}
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
};

// Séance Card (À venir)
const SeanceCard = ({ seance, index, onJoin, formatDate, formatTime, formatRelativeTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
  >
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {seance.formation_titre}
            </span>
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              À venir
            </span>
            <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {formatRelativeTime(seance.date_seance)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
            {seance.titre}
          </h3>
          {seance.description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-2">{seance.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">📅 {formatDate(seance.date_seance)}</span>
            <span className="flex items-center gap-1">⏰ {formatTime(seance.date_seance)}</span>
            <span className="flex items-center gap-1">⏱️ {seance.duree} min</span>
          </div>
        </div>
        <button
          onClick={onJoin}
          disabled={!seance.lien_reunion}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg ${
            seance.lien_reunion
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          🎥 {seance.lien_reunion ? "Rejoindre" : "En attente"}
        </button>
      </div>
    </div>
  </motion.div>
);

// Past Séance Card
const PastSeanceCard = ({ seance, index, onJoin, formatDate, formatTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 opacity-75 hover:opacity-100 transition"
  >
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
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
          <span>📅 {formatDate(seance.date_seance)}</span>
          <span>⏰ {formatTime(seance.date_seance)}</span>
          <span>⏱️ {seance.duree} min</span>
        </div>
      </div>
      {seance.lien_reunion && (
        <button
          onClick={onJoin}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-2"
        >
          📹 Replay
        </button>
      )}
    </div>
  </motion.div>
);

// Formation Card
const FormationCard = ({ formation, index, getImageUrl, formatDate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-xl transition-all group"
  >
    {formation.formations?.images?.length > 0 && (
      <div className="h-36 bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(formation.formations.images[0])}
          alt={formation.formations.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    )}
    <div className="p-4">
      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
        {formation.formations?.title}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
        {formation.formations?.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {formation.formations?.is_online && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            🌍 En ligne
          </span>
        )}
        {formation.formations?.onDemand && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
            🏢 Présentiel
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Inscrit le {formatDate(formation.created_at)}
        </span>
        <Link
          to={`/formations/${formation.formations?.id}`}
          className="text-xs text-[#1a56db] font-semibold hover:underline"
        >
          Voir →
        </Link>
      </div>
    </div>
  </motion.div>
);

export default EspaceParticipant;