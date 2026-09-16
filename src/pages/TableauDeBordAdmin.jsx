// frontend/src/pages/TableauDeBordAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "../supabaseFetch";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedType, setExpandedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTheme, setFilterTheme] = useState("all");

  // États pour les inscriptions
  const [inscriptionsEnLigne, setInscriptionsEnLigne] = useState({});
  const [inscriptionsPresentiel, setInscriptionsPresentiel] = useState({});
  const [loadingInscriptions, setLoadingInscriptions] = useState({});

  // Statistiques
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalInscriptions: 0,
    totalDemandes: 0,
    totalTests: 0,
    totalTestsGratuits: 0
  });

  const themes = [
    { id: "all", name: "Tous" },
    { id: "digital", name: "💻 Digital" },
    { id: "data", name: "📊 Data" },
    { id: "design", name: "🎨 Design" },
    { id: "management", name: "📈 Management" },
    { id: "finance", name: "💰 Finance" },
    { id: "energie", name: "🌱 Énergie" },
    { id: "langues", name: "🗣️ Langues" }
  ];

  const testTypes = {
    excel: { label: "📊 Excel", color: "bg-green-100 text-green-700" },
    python: { label: "🐍 Python", color: "bg-blue-100 text-blue-700" },
    ia: { label: "🤖 IA", color: "bg-purple-100 text-purple-700" },
    langues: { label: "🗣️ Langues", color: "bg-indigo-100 text-indigo-700" },
    default: { label: "📝 Générique", color: "bg-gray-100 text-gray-700" }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Formations
      const formationsData = await supabaseSelect("formations", "order=created_at.desc");
      setFormations(formationsData || []);

      // Codes d'accès
      if (formationsData?.length > 0) {
        const codesData = await supabaseSelect("formation_access_codes",
          `formation_id=in.(${formationsData.map(f => f.id).join(',')})`
        );

        if (codesData) {
          const codesMap = {};
          codesData.forEach(code => {
            codesMap[code.formation_id] = code;
          });
          setAccessCodes(codesMap);
        }
      }

      // Charger les inscriptions
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

  // Charger toutes les inscriptions
  const fetchAllInscriptions = async (formationsList) => {
    if (!formationsList || !formationsList.length) return;

    const formationIds = formationsList.map(f => f.id).join(',');

    // Inscriptions en ligne
    const inscriptionsData = await supabaseSelect("inscriptions",
      `select=*,users:user_id(id,email,full_name)&formation_id=in.(${formationIds})`
    );

    // Demandes présentiel
    const demandesData = await supabaseSelect("demandes_presentiel",
      `formation_id=in.(${formationIds})&order=created_at.desc`
    );

    // Organiser par formation
    const enLigneMap = {};
    if (inscriptionsData) {
      inscriptionsData.forEach(ins => {
        if (!enLigneMap[ins.formation_id]) enLigneMap[ins.formation_id] = [];
        enLigneMap[ins.formation_id].push(ins);
      });
    }
    setInscriptionsEnLigne(enLigneMap);

    const presentielMap = {};
    if (demandesData) {
      demandesData.forEach(demande => {
        if (!presentielMap[demande.formation_id]) presentielMap[demande.formation_id] = [];
        presentielMap[demande.formation_id].push(demande);
      });
    }
    setInscriptionsPresentiel(presentielMap);

    // Calculer les stats - ✅ CORRECTION : utiliser formationsList au lieu de formationsData
    const totalInscriptions = inscriptionsData?.length || 0;
    const totalDemandes = demandesData?.length || 0;
    const totalTests = formationsList.filter(f => f.has_test).length;
    const totalTestsGratuits = formationsList.filter(f => f.has_test && f.test_free).length;

    setStats({
      totalFormations: formationsList.length,
      totalInscriptions,
      totalDemandes,
      totalTests,
      totalTestsGratuits
    });
  };

  const fetchFormationInscriptions = async (formationId) => {
    setLoadingInscriptions(prev => ({ ...prev, [formationId]: true }));
    try {
      const inscriptionsData = await supabaseSelect("inscriptions",
        `select=*,users:user_id(id,email,full_name)&formation_id=eq.${formationId}`
      );
      const demandesData = await supabaseSelect("demandes_presentiel",
        `formation_id=eq.${formationId}&order=created_at.desc`
      );

      setInscriptionsEnLigne(prev => ({ ...prev, [formationId]: inscriptionsData || [] }));
      setInscriptionsPresentiel(prev => ({ ...prev, [formationId]: demandesData || [] }));
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement inscriptions");
    } finally {
      setLoadingInscriptions(prev => ({ ...prev, [formationId]: false }));
    }
  };

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

  const validerInscription = async (inscriptionId, formationId) => {
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
      if (!inscriptionsEnLigne[formationId] && !inscriptionsPresentiel[formationId]) {
        fetchFormationInscriptions(formationId);
      }
    }
  };

  // Filtrer les formations
  const filteredFormations = formations.filter(f => {
    const matchSearch = f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       f.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTheme = filterTheme === "all" || f.theme === filterTheme;
    return matchSearch && matchTheme;
  });

  // Compteurs
  const getEnLigneCount = (formationId) => inscriptionsEnLigne[formationId]?.length || 0;
  const getPresentielCount = (formationId) => inscriptionsPresentiel[formationId]?.length || 0;

  useEffect(() => {
    if (!user) navigate("/connexion");
    else if (!isAdmin) navigate("/");
    else fetchData();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-20"
    >
      <div className="max-w-7xl mx-auto p-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">⚙️ Administration</h1>
            <p className="text-gray-500">Gérez vos formations, actualités et inscriptions</p>
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <button
              onClick={() => navigate("/admin/statistics")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              📊 Statistiques
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              👥 Utilisateurs
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalFormations}</p>
                <p className="text-xs text-gray-500">Formations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalInscriptions}</p>
                <p className="text-xs text-gray-500">Inscriptions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDemandes}</p>
                <p className="text-xs text-gray-500">Demandes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTests}</p>
                <p className="text-xs text-gray-500">Tests ({stats.totalTestsGratuits} gratuits)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("formations")}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === "formations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📚 Formations ({formations.length})
          </button>
          <button
            onClick={() => setActiveTab("actualites")}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === "actualites"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📰 Actualités ({actualites.length})
          </button>
        </div>

        {/* FORMATIONS */}
        {activeTab === "formations" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Liste des formations</h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="🔍 Rechercher..."
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterTheme}
                  onChange={(e) => setFilterTheme(e.target.value)}
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => navigate("/ajouter-formation")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>➕</span> Ajouter
                </button>
              </div>
            </div>

            {filteredFormations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune formation trouvée</p>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFormations.map((f, index) => {
                    const enLigneCount = getEnLigneCount(f.id);
                    const presentielCount = getPresentielCount(f.id);
                    const hasTest = f.has_test || false;
                    const isTestFree = f.test_free || false;
                    const testType = testTypes[f.test_type] || testTypes.default;

                    return (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
                      >
                        <div className="p-5">
                          <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg text-gray-800 truncate">
                                  {f.title}
                                </h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {themes.find(t => t.id === f.theme)?.name || f.theme}
                                </span>
                                {f.is_online && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🌍 En ligne</span>
                                )}
                                {f.onDemand && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🏢 Présentiel</span>
                                )}
                                {hasTest && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${isTestFree ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    🧪 Test {isTestFree ? 'gratuit' : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                {f.description || "Aucune description"}
                              </p>
                              {hasTest && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${testType.color}`}>
                                    {testType.label}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {f.test_questions_count || 10} questions • {f.test_duration || 5} min
                                  </span>
                                  {isTestFree && (
                                    <span className="text-xs text-green-600 font-medium">✅ Gratuit</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => navigate(`/modifier-formation/${f.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteFormation(f.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Code d'accès */}
                          <div className="mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-gray-600">🔑 Code d'accès</span>
                            {accessCodes[f.id]?.access_code ? (
                              <div className="flex items-center gap-2">
                                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                                  {accessCodes[f.id].access_code}
                                </code>
                                <button
                                  onClick={() => navigator.clipboard.writeText(accessCodes[f.id].access_code)}
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                  title="Copier"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => generateCode(f.id)}
                                  disabled={generating}
                                  className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                  🔄
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => generateCode(f.id)}
                                disabled={generating}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                              >
                                🎲 Générer
                              </button>
                            )}
                          </div>

                          {/* Boutons inscriptions */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {f.is_online && (
                              <button
                                onClick={() => toggleFormationExpand(f.id, 'en_ligne')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  expandedFormation === f.id && expandedType === 'en_ligne'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                <span>🌍</span>
                                <span>En ligne</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  expandedFormation === f.id && expandedType === 'presentiel'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                }`}
                              >
                                <span>🏢</span>
                                <span>Présentiel</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
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
                          <div className="bg-blue-50 p-4 border-t border-blue-100">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                              <span>🌍</span> Inscriptions en ligne
                              <span className="text-xs text-blue-600">({enLigneCount})</span>
                              <button
                                onClick={() => fetchFormationInscriptions(f.id)}
                                className="ml-auto text-xs text-blue-600 hover:text-blue-800"
                              >
                                🔄 Actualiser
                              </button>
                            </h4>
                            {loadingInscriptions[f.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              </div>
                            ) : enLigneCount === 0 ? (
                              <p className="text-gray-500 text-center py-4">Aucune inscription en ligne</p>
                            ) : (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {inscriptionsEnLigne[f.id].map(ins => (
                                  <motion.div
                                    key={ins.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                                  >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="font-medium text-gray-800 truncate">
                                            {ins.users?.full_name || "—"}
                                          </p>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            ins.statut === 'confirme' ? 'bg-green-100 text-green-700' :
                                            ins.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {ins.statut === 'confirme' ? '✅ Confirmé' :
                                             ins.statut === 'en_attente' ? '⏳ En attente' : '❌ Annulé'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{ins.users?.email}</p>
                                        <p className="text-xs text-gray-400">
                                          📅 {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                      </div>
                                      <div className="flex gap-2 flex-shrink-0">
                                        {ins.statut === 'en_attente' && (
                                          <>
                                            <button
                                              onClick={() => validerInscription(ins.id, f.id)}
                                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                                            >
                                              ✅ Valider
                                            </button>
                                            <button
                                              onClick={() => rejeterInscription(ins.id, f.id)}
                                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                                            >
                                              ❌ Rejeter
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Liste des demandes - Présentiel */}
                        {expandedFormation === f.id && expandedType === 'presentiel' && f.onDemand && (
                          <div className="bg-orange-50 p-4 border-t border-orange-100">
                            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                              <span>🏢</span> Demandes présentiel
                              <span className="text-xs text-orange-600">({presentielCount})</span>
                              <button
                                onClick={() => fetchFormationInscriptions(f.id)}
                                className="ml-auto text-xs text-orange-600 hover:text-orange-800"
                              >
                                🔄 Actualiser
                              </button>
                            </h4>
                            {loadingInscriptions[f.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                              </div>
                            ) : presentielCount === 0 ? (
                              <p className="text-gray-500 text-center py-4">Aucune demande présentiel</p>
                            ) : (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {inscriptionsPresentiel[f.id].map(demande => (
                                  <motion.div
                                    key={demande.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                                  >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="font-medium text-gray-800 truncate">{demande.nom}</p>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            demande.statut === 'contacte' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            {demande.statut === 'contacte' ? '✅ Contacté' : '⏳ Nouvelle demande'}
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                                          <p className="text-gray-600 truncate">📧 {demande.email}</p>
                                          <p className="text-gray-600">📞 {demande.telephone}</p>
                                        </div>
                                        {demande.message && (
                                          <p className="text-sm text-gray-500 mt-2 italic truncate">
                                            "{demande.message.substring(0, 100)}"
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                          📅 {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                      </div>
                                      <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                        <a
                                          href={`tel:${demande.telephone}`}
                                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                                        >
                                          📞 Appeler
                                        </a>
                                        <a
                                          href={`mailto:${demande.email}`}
                                          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition"
                                        >
                                          ✉️ Email
                                        </a>
                                        {demande.statut !== 'contacte' && (
                                          <button
                                            onClick={() => marquerContacte(demande.id, f.id)}
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                                          >
                                            ✅ Contacté
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ACTUALITÉS */}
        {activeTab === "actualites" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Liste des actualités</h2>
              <button
                onClick={() => navigate("/ajouter-actualite")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>➕</span> Ajouter
              </button>
            </div>

            {actualites.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune actualité</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actualites.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{a.titre}</h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-3">
                          {a.contenu || "Aucun contenu"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          📅 {new Date(a.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => navigate(`/modifier-actualite/${a.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteActualite(a.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TableauDeBordAdmin;