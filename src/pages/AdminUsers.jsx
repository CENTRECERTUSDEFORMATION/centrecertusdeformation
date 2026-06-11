// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase, supabaseAdmin } from "../supabaseClient";
import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "../supabaseFetch";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

const AdminUsers = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const initialFetchDone = useRef(false);

  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [updating, setUpdating] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSeancesModal, setShowSeancesModal] = useState(false);
  const [showAssignParticipantsModal, setShowAssignParticipantsModal] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    formation_id: "",
    groupe_nom: "",
    horaire: "",
    jours: "",
    date_debut: "",
    date_fin: ""
  });
  const [assigning, setAssigning] = useState(false);

  const [groupesData, setGroupesData] = useState([]);
  const [loadingGroupes, setLoadingGroupes] = useState(false);

  const [groupParticipants, setGroupParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [loadingAvailableParticipants, setLoadingAvailableParticipants] = useState(false);

  const [seances, setSeances] = useState([]);
  const [loadingSeances, setLoadingSeances] = useState(false);
  const [newSeance, setNewSeance] = useState({
    titre: "",
    date_heure: "",
    duree: 60,
    lien_reunion: ""
  });
  const [addingSeance, setAddingSeance] = useState(false);

  const [inscriptionsEnAttente, setInscriptionsEnAttente] = useState([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
  const [selectedGroupeId, setSelectedGroupeId] = useState({});
  const [validatingInscription, setValidatingInscription] = useState(false);

  const [demandesPresentiel, setDemandesPresentiel] = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);

  const [codesMap, setCodesMap] = useState({});
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedFormationForCode, setSelectedFormationForCode] = useState(null);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "participant",
    is_approved: true
  });
  const [creating, setCreating] = useState(false);

  const MASTER_ADMIN_EMAIL = "admin@certus.tn";

  // ============ FETCH FUNCTIONS ============
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await supabaseSelect("users", "order=created_at.desc");
      const sorted = (data || []).sort((a, b) => {
        if (a.email === MASTER_ADMIN_EMAIL) return -1;
        if (b.email === MASTER_ADMIN_EMAIL) return 1;
        if (a.is_admin && !b.is_admin) return -1;
        if (!a.is_admin && b.is_admin) return 1;
        return 0;
      });
      setUsers(sorted);
    } catch {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchFormationsList = useCallback(async () => {
    try {
      const data = await supabaseSelect("formations", "select=id,title,duration,is_online,on_demand");
      setFormations(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInscriptionsEnAttente = async () => {
    setLoadingInscriptions(true);
    try {
      const data = await supabaseSelect("inscriptions",
        "select=*,users:user_id(id,email,full_name,display_name),formations:formation_id(id,title,is_online,on_demand)&statut=eq.en_attente&order=created_at.asc"
      );
      setInscriptionsEnAttente((data || []).filter(ins => ins.formations?.is_online === true));
    } catch {
      toast.error("Erreur chargement inscriptions");
    } finally {
      setLoadingInscriptions(false);
    }
  };

  const fetchDemandesPresentiel = async () => {
    setLoadingDemandes(true);
    try {
      const data = await supabaseSelect("demandes_presentiel",
        "select=*,formations:formation_id(id,title,is_online,on_demand)&statut=eq.nouvelle&order=created_at.asc"
      );
      setDemandesPresentiel(data || []);
    } catch {
      toast.error("Erreur chargement demandes");
    } finally {
      setLoadingDemandes(false);
    }
  };

  const fetchGroupes = async () => {
    setLoadingGroupes(true);
    try {
      // Récupérer tous les groupes
      const groupes = await supabaseSelect("groupes_formation", `
        select=*,
        formations:formation_id(id,title,duration,description,is_online),
        formateur:formateur_id(id,email,full_name,display_name,user_type)
      `);
      
      if (!groupes || groupes.length === 0) {
        setGroupesData([]);
        setLoadingGroupes(false);
        return;
      }

      // Récupérer toutes les inscriptions avec les utilisateurs
      const { data: inscriptionsData, error } = await supabase
        .from('inscriptions')
        .select(`
          id,
          user_id,
          formation_id,
          groupe_id,
          statut,
          created_at,
          users:user_id (
            id,
            email,
            full_name,
            display_name
          )
        `)
        .eq('statut', 'confirme');

      if (error) {
        console.error("Erreur inscriptions:", error);
      }

      // Construire les groupes avec participants
      const groupesAvecParticipants = groupes.map(groupe => {
        const participants = (inscriptionsData || [])
          .filter(ins => ins.groupe_id === groupe.id)
          .map(ins => {
            const userData = ins.users;
            return {
              id: ins.id,
              user_id: ins.user_id,
              formation_id: ins.formation_id,
              groupe_id: ins.groupe_id,
              statut: ins.statut,
              created_at: ins.created_at,
              full_name: userData?.full_name || userData?.display_name || "Nom inconnu",
              email: userData?.email || "Email inconnu"
            };
          });
        return { ...groupe, participants };
      });
      
      setGroupesData(groupesAvecParticipants);

      // Codes d'accès
      const { data: codes } = await supabase
        .from("formation_access_codes")
        .select("formation_id, access_code");
        
      if (codes) {
        const cmap = {};
        codes.forEach(c => { cmap[c.formation_id] = c.access_code; });
        setCodesMap(cmap);
      }
    } catch (err) {
      console.error("Erreur fetchGroupes:", err);
      toast.error("Erreur chargement groupes");
    } finally {
      setLoadingGroupes(false);
    }
  };

  const fetchAvailableParticipantsForGroup = async (groupeId, formationId) => {
    setLoadingAvailableParticipants(true);
    try {
      const all = await supabaseSelect("users", "select=id,email,full_name,display_name,is_approved&user_type=eq.participant&is_admin=eq.false");
      const existing = await supabaseSelect("inscriptions", `select=user_id&formation_id=eq.${formationId}&statut=eq.confirme`);
      const assignedIds = new Set(existing.map(ins => ins.user_id));
      setAvailableParticipants(all.filter(p => !assignedIds.has(p.id)));
    } catch {
      toast.error("Erreur chargement participants");
    } finally {
      setLoadingAvailableParticipants(false);
    }
  };

  const fetchGroupParticipants = async (groupeId) => {
    setLoadingParticipants(true);
    try {
      const { data } = await supabase
        .from('inscriptions')
        .select(`
          id,
          user_id,
          formation_id,
          groupe_id,
          statut,
          created_at,
          users:user_id (
            id,
            email,
            full_name,
            display_name
          )
        `)
        .eq('groupe_id', groupeId)
        .eq('statut', 'confirme');
        
      setGroupParticipants((data || []).map(ins => ({
        id: ins.id,
        user_id: ins.user_id,
        formation_id: ins.formation_id,
        groupe_id: ins.groupe_id,
        statut: ins.statut,
        created_at: ins.created_at,
        full_name: ins.users?.full_name || ins.users?.display_name || "Nom inconnu",
        email: ins.users?.email || "Email inconnu"
      })));
    } catch {
      toast.error("Erreur chargement participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchSeances = async (assignmentId) => {
    setLoadingSeances(true);
    try {
      const data = await supabaseSelect("seances", `assignment_id=eq.${assignmentId}&order=date_seance.asc`);
      setSeances(data || []);
    } catch {
      toast.error("Erreur chargement séances");
    } finally {
      setLoadingSeances(false);
    }
  };

  // ============ ACTIONS UTILISATEURS ============
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.full_name || newUser.password.length < 6) {
      toast.error("Tous les champs obligatoires et mot de passe min 6 caractères");
      return;
    }
    setCreating(true);
    try {
      if (!supabaseAdmin) throw new Error("Configuration admin Supabase manquante");
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: { full_name: newUser.full_name, user_type: newUser.user_type }
      });
      if (authError) {
        toast.error(authError.message.includes("already been registered") ? `Email ${newUser.email} existe déjà` : "Erreur Auth");
        return;
      }
      const isAdminUser = newUser.user_type === "admin";
      await supabaseInsert("users", {
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.full_name,
        user_type: isAdminUser ? "participant" : newUser.user_type,
        is_admin: isAdminUser,
        is_approved: newUser.is_approved
      });
      toast.success(`✅ ${isAdminUser ? "Administrateur" : "Utilisateur"} ${newUser.email} créé`);
      setShowAddModal(false);
      setNewUser({ email: "", password: "", full_name: "", user_type: "participant", is_approved: true });
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleApprove = async (user) => {
    if (user.email === MASTER_ADMIN_EMAIL) {
      toast.warning("⚠️ Admin principal non modifiable");
      return;
    }
    const newStatus = !user.is_approved;
    setUpdating(`approve-${user.id}`);
    try {
      await supabaseUpdate("users", user.id, { is_approved: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_approved: newStatus } : u));
      toast.success(`✅ ${newStatus ? "Approuvé" : "Désapprouvé"}`);
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (id, email) => {
    if (email === MASTER_ADMIN_EMAIL) {
      toast.warning("⚠️ Admin principal non supprimable");
      return;
    }
    if (!window.confirm(`Supprimer ${email} ?`)) return;
    setUpdating(`delete-${id}`);
    try {
      await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
      await supabaseDelete("users", id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(`✅ ${email} supprimé`);
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  };

  // ============ ACTIONS GROUPES ============
  const addAssignment = async () => {
    if (!newAssignment.formation_id || !newAssignment.groupe_nom.trim()) {
      toast.error("Formation et nom du groupe requis");
      return;
    }
    setAssigning(true);
    try {
      await supabaseInsert("groupes_formation", {
        formation_id: newAssignment.formation_id,
        nom: newAssignment.groupe_nom.trim(),
        formateur_id: selectedFormateur.id,
        horaire: newAssignment.horaire || null,
        jours: newAssignment.jours || null,
        date_debut: newAssignment.date_debut || null,
        date_fin: newAssignment.date_fin || null,
        statut: "actif"
      });
      toast.success("✅ Groupe créé");
      await fetchGroupes();
      setShowAssignModal(false);
      setNewAssignment({
        formation_id: "",
        groupe_nom: "",
        horaire: "",
        jours: "",
        date_debut: "",
        date_fin: ""
      });
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setAssigning(false);
    }
  };

  const removeAssignment = async (groupId) => {
    if (!window.confirm("Retirer ce groupe ?")) return;
    try {
      await supabaseDelete("groupes_formation", groupId);
      toast.success("Groupe retiré");
      await fetchGroupes();
    } catch {
      toast.error("❌ Erreur");
    }
  };

  const assignParticipantToGroup = async (groupeId, formationId, userId) => {
    try {
      const existing = await supabaseSelect("inscriptions", `user_id=eq.${userId}&formation_id=eq.${formationId}&statut=eq.confirme`);
      if (existing && existing.length > 0) {
        toast.warning("⚠️ Déjà inscrit");
        return;
      }
      await supabaseInsert("inscriptions", {
        formation_id: formationId,
        user_id: userId,
        groupe_id: groupeId,
        statut: "confirme",
        created_at: new Date().toISOString()
      });
      toast.success("✅ Participant assigné");
      await fetchGroupes();
      if (selectedGroup) await fetchGroupParticipants(selectedGroup.id);
    } catch {
      toast.error("❌ Erreur assignation");
    }
  };

  const removeParticipantFromGroup = async (inscriptionId) => {
    if (!window.confirm("Retirer ce participant ?")) return;
    try {
      await supabaseDelete("inscriptions", inscriptionId);
      toast.success("✅ Participant retiré");
      await fetchGroupes();
      if (selectedGroup) await fetchGroupParticipants(selectedGroup.id);
    } catch {
      toast.error("❌ Erreur");
    }
  };

  // ============ ACTIONS SÉANCES ============
  const addSeance = async () => {
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
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setAddingSeance(false);
    }
  };

  const deleteSeance = async (seanceId) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await supabaseDelete("seances", seanceId);
      toast.success("Séance supprimée");
      await fetchSeances(selectedAssignment.id);
    } catch {
      toast.error("❌ Erreur");
    }
  };

  const genererLienJitsi = () => {
    const nomSalle = `certus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setNewSeance({ ...newSeance, lien_reunion: `https://meet.jit.si/${nomSalle}` });
    toast.success("🔗 Lien Jitsi généré");
  };

  // ============ ACTIONS INSCRIPTIONS ============
  const validerInscription = async (inscriptionId, formationId, userId, groupeId) => {
    if (!groupeId) {
      toast.error("Sélectionnez un groupe");
      return;
    }
    setValidatingInscription(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const existing = await supabaseSelect("inscriptions", `user_id=eq.${userId}&formation_id=eq.${formationId}&statut=eq.confirme`);
      if (existing && existing.length > 0) {
        toast.warning("⚠️ Déjà inscrit");
        setValidatingInscription(false);
        return;
      }
      await supabaseUpdate("inscriptions", inscriptionId, {
        statut: "confirme",
        date_confirmation: new Date().toISOString(),
        confirmed_by: user?.id,
        groupe_id: groupeId
      });
      toast.success("✅ Inscription validée");
      await fetchInscriptionsEnAttente();
      await fetchGroupes();
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setValidatingInscription(false);
    }
  };

  const marquerDemandeContactee = async (demandeId) => {
    try {
      await supabaseUpdate("demandes_presentiel", demandeId, {
        statut: "contacte",
        contacte_le: new Date().toISOString()
      });
      toast.success("✅ Demandeur contacté");
      await fetchDemandesPresentiel();
    } catch {
      toast.error("❌ Erreur");
    }
  };

  // ============ ACTIONS CODES ============
  const generateAccessCode = async (formationId, formationTitle) => {
    setGeneratingCode(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      const existing = await supabaseSelect("formation_access_codes", `formation_id=eq.${formationId}`);
      if (existing && existing.length > 0) {
        await supabaseUpdate("formation_access_codes", existing[0].id, { access_code: newCode });
      } else {
        await supabaseInsert("formation_access_codes", { formation_id: formationId, access_code: newCode });
      }
      setGeneratedCode(newCode);
      setSelectedFormationForCode({ id: formationId, title: formationTitle });
      setShowCodeModal(true);
      await fetchGroupes();
      toast.success(`✅ Code: ${newCode}`);
    } catch {
      toast.error("❌ Erreur");
    } finally {
      setGeneratingCode(false);
    }
  };

  // ============ INITIALISATION ============
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUsers();
      fetchFormationsList();
      fetchInscriptionsEnAttente();
      fetchDemandesPresentiel();
      fetchGroupes();
    }
  }, [isAdmin]);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vraiFormateursCount = users.filter(u => u.user_type === "formateur" && !u.is_admin).length;

  const stats = [
    { label: "Total", value: users.length, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "Administrateurs", value: users.filter(u => u.is_admin).length, icon: "👑", color: "from-yellow-500 to-yellow-600" },
    { label: "Formateurs", value: vraiFormateursCount, icon: "👨‍🏫", color: "from-purple-500 to-purple-600" },
    { label: "Participants", value: users.filter(u => u.user_type === "participant" && !u.is_admin).length, icon: "👨‍🎓", color: "from-green-500 to-green-600" },
    { label: "Approuvés", value: users.filter(u => u.is_approved).length, icon: "✅", color: "from-teal-500 to-teal-600" },
  ];

  if (loading || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet><title>Admin - Gestion | Centre Certus</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">⚙️ Administration</h1>
                <p className="text-blue-100 mt-1">Gérez les utilisateurs, groupes et inscriptions</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="bg-white text-[#1a56db] px-5 py-2.5 rounded-xl font-semibold">
                ➕ Ajouter un utilisateur
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
                <div className="flex justify-between items-center">
                  <div><p className="text-sm opacity-90">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Onglets */}
          <div className="flex gap-4 mb-6 border-b flex-wrap">
            <button onClick={() => setActiveTab("users")} className={`pb-2 px-4 font-medium ${activeTab === "users" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>👥 Utilisateurs ({users.length})</button>
            <button onClick={() => setActiveTab("inscriptions")} className={`pb-2 px-4 font-medium ${activeTab === "inscriptions" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>📝 Inscriptions ({inscriptionsEnAttente.length})</button>
            <button onClick={() => setActiveTab("demandes")} className={`pb-2 px-4 font-medium ${activeTab === "demandes" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>📋 Demandes ({demandesPresentiel.length})</button>
            <button onClick={() => setActiveTab("groupes")} className={`pb-2 px-4 font-medium ${activeTab === "groupes" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>👨‍🏫 Groupes ({groupesData.length})</button>
          </div>

          {/* ==================== VUE UTILISATEURS ==================== */}
          {activeTab === "users" && (
            <>
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <input type="text" placeholder="🔍 Rechercher par nom ou email..." className="w-full p-3 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-4 text-left">Utilisateur</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Formations</th>
                        <th className="p-4 text-left">Statut</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const isMaster = u.email === MASTER_ADMIN_EMAIL;
                        const isAdminUser = u.is_admin === true;
                        let userTypeLabel = "👨‍🎓 Participant";
                        if (isAdminUser) userTypeLabel = "👑 Administrateur";
                        else if (u.user_type === "formateur") userTypeLabel = "👨‍🏫 Formateur";
                        
                        // Récupérer les formations de l'utilisateur
                        const userFormations = groupesData
                          .filter(g => g.participants?.some(p => p.user_id === u.id))
                          .map(g => g.formations?.title)
                          .filter(Boolean);
                        
                        return (
                          <tr key={u.id} className={`border-b hover:bg-gray-50 ${isAdminUser ? "bg-blue-50" : ""}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${isMaster ? "bg-red-500" : isAdminUser ? "bg-yellow-500" : u.user_type === "formateur" ? "bg-purple-500" : "bg-gradient-to-r from-[#1a56db] to-[#76c21f]"}`}>
                                  {u.full_name?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <span>{u.full_name || "—"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4">{userTypeLabel}</td>
                            <td className="p-4">
                              {userFormations.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {userFormations.map((f, idx) => (
                                    <span key={idx} className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Aucune</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {u.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                              </span>
                            </td>
                            <td className="p-4">
                              {!isMaster && (
                                <div className="flex gap-2">
                                  <button onClick={() => toggleApprove(u)} className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs">
                                    {u.is_approved ? "⛔ Désapprouver" : "✅ Approuver"}
                                  </button>
                                  <button onClick={() => deleteUser(u.id, u.email)} className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs">
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ==================== VUE INSCRIPTIONS ==================== */}
          {activeTab === "inscriptions" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-800">📝 Inscriptions en attente</h2>
              </div>
              {loadingInscriptions ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div></div>
              ) : inscriptionsEnAttente.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune inscription</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left">Participant</th>
                        <th className="p-4 text-left">Formation</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Groupe</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscriptionsEnAttente.map(ins => {
                        const groupesDisponibles = groupesData.filter(g => g.formation_id === ins.formation_id);
                        return (
                          <tr key={ins.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <p className="font-medium">{ins.users?.full_name || "—"}</p>
                              <p className="text-xs text-gray-500">{ins.users?.email}</p>
                            </td>
                            <td className="p-4">{ins.formations?.title}</td>
                            <td className="p-4 text-gray-500">{new Date(ins.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <select
                                className="border rounded-lg px-3 py-1 text-sm w-44"
                                value={selectedGroupeId[ins.id] || ""}
                                onChange={(e) => setSelectedGroupeId(prev => ({ ...prev, [ins.id]: e.target.value }))}
                              >
                                <option value="">Sélectionner</option>
                                {groupesDisponibles.map(g => (
                                  <option key={g.id} value={g.id}>{g.nom}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => validerInscription(ins.id, ins.formation_id, ins.user_id, selectedGroupeId[ins.id])}
                                disabled={!selectedGroupeId[ins.id]}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs disabled:opacity-50"
                              >
                                ✅ Valider
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== VUE DEMANDES ==================== */}
          {activeTab === "demandes" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-800">📋 Demandes présentiel</h2>
              </div>
              {loadingDemandes ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div></div>
              ) : demandesPresentiel.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune demande</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Formation</th>
                        <th className="p-4 text-left">Demandeur</th>
                        <th className="p-4 text-left">Contact</th>
                        <th className="p-4 text-left">Message</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandesPresentiel.map(d => (
                        <tr key={d.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                          <td className="p-4">{d.formations?.title}</td>
                          <td className="p-4 font-medium">{d.nom}</td>
                          <td className="p-4">
                            <p className="text-sm">{d.email}</p>
                            <p className="text-xs text-gray-500">{d.telephone}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-gray-500 max-w-xs truncate">{d.message || "—"}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <a href={`tel:${d.telephone}`} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs">📞</a>
                              <a href={`mailto:${d.email}`} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs">✉️</a>
                              <button onClick={() => marquerDemandeContactee(d.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs">✅</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== VUE GROUPES ==================== */}
          {activeTab === "groupes" && (
            <div className="space-y-6">
              {loadingGroupes ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db] mx-auto"></div>
                </div>
              ) : groupesData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500">Aucun groupe</p>
                  <p className="text-sm text-gray-400 mt-2">Créez un groupe via "Assigner formation"</p>
                </div>
              ) : (
                groupesData.map(groupe => {
                  const formateur = users.find(u => u.id === groupe.formateur_id);
                  return (
                    <div key={groupe.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{groupe.formations?.title}</h3>
                            <p className="text-purple-200 text-sm">Groupe: {groupe.nom}</p>
                            {groupe.horaire && <p className="text-purple-200 text-xs mt-1">📅 {groupe.horaire} • {groupe.jours || ""}</p>}
                            {codesMap[groupe.formation_id] && <p className="text-purple-200 text-xs mt-1">🔑 Code: {codesMap[groupe.formation_id]}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formateur?.full_name || "Formateur"}</p>
                            <p className="text-purple-200 text-xs">{formateur?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>👥</span> Participants assignés ({groupe.participants?.length || 0})
                          </h4>
                          {groupe.participants && groupe.participants.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {groupe.participants.map(p => {
                                const userInfo = users.find(u => u.id === p.user_id);
                                const displayName = userInfo?.full_name || p.full_name || "Nom inconnu";
                                const displayEmail = userInfo?.email || p.email || "Email inconnu";
                                return (
                                  <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{displayEmail}</p>
                                      </div>
                                      <button
                                        onClick={() => removeParticipantFromGroup(p.id)}
                                        className="ml-2 text-red-400 hover:text-red-600 p-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center border border-dashed">
                              <p className="text-sm text-gray-400">Aucun participant</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                          <button
                            onClick={async () => { setSelectedAssignment(groupe); await fetchSeances(groupe.id); setShowSeancesModal(true); }}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm"
                          >
                            📅 Séances
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedGroup(groupe);
                              await fetchAvailableParticipantsForGroup(groupe.id, groupe.formation_id);
                              await fetchGroupParticipants(groupe.id);
                              setShowAssignParticipantsModal(true);
                            }}
                            className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm"
                          >
                            ➕ Assigner
                          </button>
                          <button
                            onClick={() => generateAccessCode(groupe.formation_id, groupe.formations?.title)}
                            disabled={generatingCode}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm"
                          >
                            🎲 Code
                          </button>
                          <button
                            onClick={() => removeAssignment(groupe.id)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                          >
                            🗑️ Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">📚 Créer un nouveau groupe</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  {users.filter(u => u.user_type === "formateur" && !u.is_admin).map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedFormateur(f); setShowAssignModal(true); }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                    >
                      + {f.full_name || f.email?.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJOUT UTILISATEUR */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl flex justify-between">
                <h3 className="text-xl font-bold">Ajouter un utilisateur</h3>
                <button onClick={() => setShowAddModal(false)}>✕</button>
              </div>
              <form onSubmit={createUser} className="p-6 space-y-4">
                <input type="text" placeholder="Nom complet" className="w-full border rounded-xl p-3" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} required />
                <input type="email" placeholder="Email" className="w-full border rounded-xl p-3" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                <input type="password" placeholder="Mot de passe (min. 6)" className="w-full border rounded-xl p-3" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                <select className="w-full border rounded-xl p-3" value={newUser.user_type} onChange={e => setNewUser({ ...newUser, user_type: e.target.value })}>
                  <option value="participant">👨‍🎓 Participant</option>
                  <option value="formateur">👨‍🏫 Formateur</option>
                  <option value="admin">👑 Administrateur</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newUser.is_approved} onChange={e => setNewUser({ ...newUser, is_approved: e.target.checked })} /> ✅ Approuvé
                </label>
                <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold">
                  {creating ? "Création..." : "➕ Créer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CRÉATION GROUPE */}
      <AnimatePresence>
        {showAssignModal && selectedFormateur && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAssignModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0 flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">📚 Créer un groupe</h3>
                  <p className="text-blue-100 text-sm">Formateur: {selectedFormateur.full_name}</p>
                </div>
                <button onClick={() => setShowAssignModal(false)}>✕</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <select className="border rounded-lg p-2" value={newAssignment.formation_id} onChange={e => setNewAssignment({ ...newAssignment, formation_id: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                  </select>
                  <input type="text" placeholder="Nom du groupe *" className="border rounded-lg p-2" value={newAssignment.groupe_nom} onChange={e => setNewAssignment({ ...newAssignment, groupe_nom: e.target.value })} />
                  <input type="text" placeholder="Horaire" className="border rounded-lg p-2" value={newAssignment.horaire} />
                  <input type="text" placeholder="Jours" className="border rounded-lg p-2" value={newAssignment.jours} />
                  <input type="date" className="border rounded-lg p-2" value={newAssignment.date_debut} />
                  <input type="date" className="border rounded-lg p-2" value={newAssignment.date_fin} />
                </div>
                <button onClick={addAssignment} disabled={assigning} className="w-full bg-green-600 text-white py-2 rounded-lg">
                  {assigning ? "Création..." : "➕ Créer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SÉANCES */}
      <AnimatePresence>
        {showSeancesModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowSeancesModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0 flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">📅 Séances</h3>
                  <p className="text-blue-100 text-sm">{selectedAssignment.formations?.title}</p>
                </div>
                <button onClick={() => setShowSeancesModal(false)}>✕</button>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">Séances</h4>
                {loadingSeances ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56db]"></div></div>
                ) : seances.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune séance</p>
                ) : (
                  seances.map(s => (
                    <div key={s.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{s.titre}</p>
                          <p className="text-xs text-gray-500">{new Date(s.date_seance).toLocaleString()} - {s.duree} min</p>
                          {s.lien_reunion && <a href={s.lien_reunion} target="_blank" className="text-xs text-blue-600 break-all">🔗 {s.lien_reunion}</a>}
                        </div>
                        <button onClick={() => deleteSeance(s.id)} className="text-red-500 text-sm px-2">🗑️</button>
                      </div>
                    </div>
                  ))
                )}
                <h4 className="font-semibold mt-4 mb-3">➕ Ajouter</h4>
                <div className="grid grid-cols-1 gap-3">
                  <input type="text" placeholder="Titre" className="border rounded-lg p-2" value={newSeance.titre} onChange={e => setNewSeance({ ...newSeance, titre: e.target.value })} />
                  <input type="datetime-local" className="border rounded-lg p-2" value={newSeance.date_heure} onChange={e => setNewSeance({ ...newSeance, date_heure: e.target.value })} />
                  <input type="number" placeholder="Durée (minutes)" className="border rounded-lg p-2" value={newSeance.duree} onChange={e => setNewSeance({ ...newSeance, duree: parseInt(e.target.value) || 60 })} />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Lien Jitsi" className="border rounded-lg p-2 flex-1" value={newSeance.lien_reunion} />
                    <button type="button" onClick={genererLienJitsi} className="bg-gray-200 px-3 rounded-lg text-sm">🎲 Jitsi</button>
                  </div>
                  <button onClick={addSeance} disabled={addingSeance} className="bg-blue-600 text-white py-2 rounded-lg">
                    {addingSeance ? "Ajout..." : "➕ Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ASSIGNER PARTICIPANTS */}
      <AnimatePresence>
        {showAssignParticipantsModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAssignParticipantsModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">👥 Participants</h3>
                  <p className="text-purple-200 text-sm">{selectedGroup.formations?.title}</p>
                </div>
                <button onClick={() => setShowAssignParticipantsModal(false)}>✕</button>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">✅ Actuels ({groupParticipants.length})</h4>
                {groupParticipants.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{p.full_name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                    <button onClick={() => removeParticipantFromGroup(p.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs">Retirer</button>
                  </div>
                ))}
                <h4 className="font-semibold mt-4 mb-3">📋 Disponibles ({availableParticipants.length})</h4>
                {availableParticipants.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{p.full_name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                    <button onClick={() => assignParticipantToGroup(selectedGroup.id, selectedGroup.formation_id, p.id)} className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs">Assigner</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CODE */}
      <AnimatePresence>
        {showCodeModal && selectedFormationForCode && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCodeModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-t-2xl flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">🎲 Code</h3>
                  <p className="text-yellow-100 text-sm">{selectedFormationForCode.title}</p>
                </div>
                <button onClick={() => setShowCodeModal(false)}>✕</button>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-3">Code pour le formateur :</p>
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <p className="text-4xl font-bold tracking-wider">{generatedCode}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success("Copié"); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">
                  📋 Copier
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminUsers;