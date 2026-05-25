// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback } from "react";
import { supabase, supabaseAdmin } from "../supabaseClient";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

const AdminUsers = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSeancesModal, setShowSeancesModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAssignParticipantsModal, setShowAssignParticipantsModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFormationForCode, setSelectedFormationForCode] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [assignedFormations, setAssignedFormations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [assignedParticipantsList, setAssignedParticipantsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSeances, setLoadingSeances] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingAvailableParticipants, setLoadingAvailableParticipants] = useState(false);
  const [activeView, setActiveView] = useState("users");
  const [generatingCode, setGeneratingCode] = useState(false);
  
  const [formateursData, setFormateursData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState({});
  const [nextSeancesData, setNextSeancesData] = useState({});
  const [loadingFormateurs, setLoadingFormateurs] = useState(false);
  const [codesMap, setCodesMap] = useState({});

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "participant",
    is_approved: true
  });
  const [newAssignment, setNewAssignment] = useState({
    formation_id: "",
    groupe_nom: "",
    horaire: "",
    jours: "",
    date_debut: "",
    date_fin: "",
    duree_restante: 0
  });
  const [newSeance, setNewSeance] = useState({
    titre: "",
    date_heure: "",
    duree: 60
  });
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [addingSeance, setAddingSeance] = useState(false);

  const MASTER_ADMIN_EMAIL = "admin@certus.tn";

  const extractDurationHours = (durationStr) => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => {
        if (a.email === MASTER_ADMIN_EMAIL) return -1;
        if (b.email === MASTER_ADMIN_EMAIL) return 1;
        if (a.is_admin && !b.is_admin) return -1;
        if (!a.is_admin && b.is_admin) return 1;
        return 0;
      });
      setUsers(sorted);
    } catch (err) {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchFormations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("formations")
        .select("id, title, duration");
      if (error) throw error;
      const formatted = (data || []).map(f => ({
        ...f,
        duree_totale: extractDurationHours(f.duration)
      }));
      setFormations(formatted);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchFormateurAssignments = async (formateurId) => {
    setLoadingAssignments(true);
    try {
      const { data, error } = await supabase
        .from("formateur_assignments")
        .select(`*, formations:formation_id (id, title, duration, description)`)
        .eq("formateur_id", formateurId);
      if (error) throw error;
      const formatted = (data || []).map(ass => ({
        ...ass,
        formations: ass.formations ? {
          ...ass.formations,
          duree_totale: extractDurationHours(ass.formations.duration)
        } : null
      }));
      setAssignedFormations(formatted);
    } catch (err) {
      toast.error("Erreur chargement assignations");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchSeances = async (assignmentId) => {
    setLoadingSeances(true);
    try {
      const { data, error } = await supabase
        .from("seances")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("date_seance", { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map(s => ({
        ...s,
        date_heure: s.date_seance,
        titre: s.titre,
        duree: s.duree
      }));
      setSeances(normalized);
    } catch (err) {
      toast.error("Erreur chargement séances");
    } finally {
      setLoadingSeances(false);
    }
  };

  const fetchGroupParticipants = async (formationId) => {
    setLoadingParticipants(true);
    try {
      const { data, error } = await supabase
        .from("inscriptions")
        .select(`*, users:user_id (id, email, full_name, is_approved)`)
        .eq("formation_id", formationId);
      if (error) throw error;
      setGroupParticipants(data || []);
    } catch (err) {
      toast.error("Erreur chargement participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchAvailableParticipants = async (formationId) => {
    setLoadingAvailableParticipants(true);
    try {
      const { data: all, error: err1 } = await supabase
        .from("users")
        .select("id, email, full_name, is_approved")
        .eq("user_type", "participant")
        .eq("is_admin", false);
      if (err1) throw err1;
      const { data: existing, error: err2 } = await supabase
        .from("inscriptions")
        .select("user_id")
        .eq("formation_id", formationId);
      if (err2) throw err2;
      const assignedIds = new Set(existing.map(ins => ins.user_id));
      setAvailableParticipants(all.filter(p => !assignedIds.has(p.id)));
      setAssignedParticipantsList(all.filter(p => assignedIds.has(p.id)));
    } catch (err) {
      toast.error("Erreur chargement participants disponibles");
    } finally {
      setLoadingAvailableParticipants(false);
    }
  };

  const assignParticipantToFormation = async (formationId, userId) => {
    try {
      const { error } = await supabase
        .from("inscriptions")
        .insert({ formation_id: formationId, user_id: userId });
      if (error) throw error;
      toast.success("✅ Participant assigné");
      await fetchAvailableParticipants(formationId);
      await fetchGroupParticipants(formationId);
    } catch (err) {
      toast.error("❌ Erreur assignation");
    }
  };

  const removeParticipantFromFormation = async (formationId, userId) => {
    if (!window.confirm("Retirer ce participant ?")) return;
    try {
      const { error } = await supabase
        .from("inscriptions")
        .delete()
        .eq("formation_id", formationId)
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("✅ Participant retiré");
      await fetchAvailableParticipants(formationId);
      await fetchGroupParticipants(formationId);
    } catch (err) {
      toast.error("❌ Erreur retrait");
    }
  };

  const generateAccessCode = async (formationId, formationTitle) => {
    setGeneratingCode(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      const { data: existing } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", formationId)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("formation_access_codes")
          .update({ access_code: newCode, teacher_code: newCode, participant_code: newCode, updated_at: new Date() })
          .eq("formation_id", formationId);
      } else {
        await supabase
          .from("formation_access_codes")
          .insert({ formation_id: formationId, access_code: newCode, teacher_code: newCode, participant_code: newCode });
      }
      setGeneratedCode(newCode);
      setSelectedFormationForCode({ id: formationId, title: formationTitle });
      setShowCodeModal(true);
      setCodesMap(prev => ({ ...prev, [formationId]: newCode }));
      toast.success(`✅ Code généré: ${newCode}`);
    } catch (err) {
      toast.error("❌ Erreur génération code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const loadFormateursGroupsData = async () => {
    setLoadingFormateurs(true);
    try {
      const { data: formateurs, error: err1 } = await supabase
        .from("users")
        .select("*")
        .eq("user_type", "formateur")
        .eq("is_admin", false);
      if (err1) throw err1;
      setFormateursData(formateurs || []);

      const { data: assignments, error: err2 } = await supabase
        .from("formateur_assignments")
        .select(`*, formations:formation_id (id, title, duration, description)`);
      if (err2) throw err2;

      const assignmentsList = (assignments || []).map(ass => ({
        ...ass,
        formations: ass.formations ? {
          ...ass.formations,
          duree_totale: extractDurationHours(ass.formations.duration)
        } : null
      }));
      const map = {};
      assignmentsList.forEach(ass => {
        if (!map[ass.formateur_id]) map[ass.formateur_id] = [];
        map[ass.formateur_id].push(ass);
      });
      setAssignmentsData(map);

      const { data: codes } = await supabase.from("formation_access_codes").select("formation_id, access_code");
      if (codes) {
        const cmap = {};
        codes.forEach(c => { cmap[c.formation_id] = c.access_code; });
        setCodesMap(cmap);
      }

      const nextMap = {};
      for (const ass of assignmentsList) {
        const { data: seancesData } = await supabase
          .from("seances")
          .select("*")
          .eq("assignment_id", ass.id)
          .order("date_seance", { ascending: true })
          .limit(1);
        if (seancesData && seancesData.length) nextMap[ass.id] = seancesData[0];
      }
      setNextSeancesData(nextMap);
    } catch (err) {
      toast.error("Erreur chargement données groupes");
    } finally {
      setLoadingFormateurs(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchFormations();
    }
  }, [isAdmin, fetchUsers, fetchFormations]);

  useEffect(() => {
    if (activeView === "groups" && isAdmin) {
      loadFormateursGroupsData();
    }
  }, [activeView, isAdmin]);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMasterAdmin = (u) => u?.email === MASTER_ADMIN_EMAIL;

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error("Tous les champs obligatoires");
      return;
    }
    if (newUser.password.length < 6) {
      toast.error("Mot de passe min 6 caractères");
      return;
    }
    setCreating(true);
    try {
      if (!supabaseAdmin) {
        throw new Error("Configuration admin Supabase manquante");
      }
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: { full_name: newUser.full_name }
      });
      if (authError) {
        toast.error(authError.message.includes("already been registered") ? `Email ${newUser.email} existe déjà` : "Erreur Auth");
        return;
      }
      
      const isAdminUser = newUser.user_type === "admin";
      
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.full_name,
        user_type: isAdminUser ? "participant" : newUser.user_type,
        is_admin: isAdminUser,
        is_approved: newUser.is_approved
      });
      if (dbError) throw dbError;
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
    // Seul l'admin principal ne peut pas être modifié
    if (isMasterAdmin(user)) {
      toast.warning("⚠️ Admin principal non modifiable");
      return;
    }
    const newStatus = !user.is_approved;
    setUpdating(`approve-${user.id}`);
    try {
      await supabase.from("users").update({ is_approved: newStatus }).eq("id", user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_approved: newStatus } : u));
      toast.success(`✅ ${newStatus ? "Approuvé" : "Désapprouvé"}`);
    } catch (err) {
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (id, email) => {
    // Seul l'admin principal ne peut pas être supprimé
    if (email === MASTER_ADMIN_EMAIL) {
      toast.warning("⚠️ Admin principal non supprimable");
      return;
    }
    if (!window.confirm(`Supprimer ${email} ?`)) return;
    setUpdating(`delete-${id}`);
    try {
      await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
      await supabase.from("users").delete().eq("id", id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success(`✅ ${email} supprimé`);
    } catch (err) {
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  };

  const addAssignment = async () => {
    if (!newAssignment.formation_id || !newAssignment.groupe_nom.trim()) {
      toast.error("Formation et nom du groupe requis");
      return;
    }
    setAssigning(true);
    try {
      const formation = formations.find(f => f.id === newAssignment.formation_id);
      const dureeRestante = formation?.duree_totale || 0;
      await supabase.from("formateur_assignments").insert({
        formateur_id: selectedFormateur.id,
        formation_id: newAssignment.formation_id,
        groupe_nom: newAssignment.groupe_nom.trim(),
        horaire: newAssignment.horaire || null,
        jours: newAssignment.jours || null,
        date_debut: newAssignment.date_debut || null,
        date_fin: newAssignment.date_fin || null,
        duree_restante: dureeRestante
      });
      toast.success("✅ Formation assignée");
      await fetchFormateurAssignments(selectedFormateur.id);
      await loadFormateursGroupsData();
      setNewAssignment({
        formation_id: "",
        groupe_nom: "",
        horaire: "",
        jours: "",
        date_debut: "",
        date_fin: "",
        duree_restante: 0
      });
    } catch (err) {
      toast.error("❌ Erreur");
    } finally {
      setAssigning(false);
    }
  };

  const removeAssignment = async (assignmentId) => {
    if (!window.confirm("Retirer cette assignation ?")) return;
    try {
      await supabase.from("formateur_assignments").delete().eq("id", assignmentId);
      toast.success("Assignation retirée");
      await fetchFormateurAssignments(selectedFormateur.id);
      await loadFormateursGroupsData();
    } catch (err) {
      toast.error("❌ Erreur");
    }
  };

  const updateDureeRestante = async (assignmentId, nouvelleDuree) => {
    if (isNaN(nouvelleDuree) || nouvelleDuree < 0) {
      toast.error("Durée invalide");
      return;
    }
    try {
      await supabase.from("formateur_assignments").update({ duree_restante: nouvelleDuree }).eq("id", assignmentId);
      toast.success("Durée restante mise à jour");
      await fetchFormateurAssignments(selectedFormateur.id);
      await loadFormateursGroupsData();
    } catch (err) {
      toast.error("❌ Erreur");
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
        statut: "planifie"
      });
      toast.success("✅ Séance ajoutée");
      await fetchSeances(selectedAssignment.id);
      await loadFormateursGroupsData();
      setNewSeance({ titre: "", date_heure: "", duree: 60 });
    } catch (err) {
      toast.error("❌ Erreur");
    } finally {
      setAddingSeance(false);
    }
  };

  const updateSeanceStatut = async (seanceId, statut) => {
    try {
      await supabase.from("seances").update({ statut, updated_at: new Date() }).eq("id", seanceId);
      toast.success("Statut mis à jour");
      await fetchSeances(selectedAssignment.id);
      await loadFormateursGroupsData();
    } catch (err) {
      toast.error("❌ Erreur");
    }
  };

  const deleteSeance = async (seanceId) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await supabase.from("seances").delete().eq("id", seanceId);
      toast.success("Séance supprimée");
      await fetchSeances(selectedAssignment.id);
      await loadFormateursGroupsData();
    } catch (err) {
      toast.error("❌ Erreur");
    }
  };

  const stats = [
    { label: "Total", value: users.length, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "Administrateurs", value: users.filter(u => u.is_admin).length, icon: "👑", color: "from-yellow-500 to-yellow-600" },
    { label: "Formateurs", value: users.filter(u => u.user_type === "formateur" && !u.is_admin).length, icon: "👨‍🏫", color: "from-purple-500 to-purple-600" },
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
      <Helmet>
        <title>Admin - Gestion des utilisateurs | Centre Certus</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">👥 Gestion des utilisateurs</h1>
                <p className="text-blue-100 mt-1">Gérez les formateurs, participants et leurs formations</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="bg-white text-[#1a56db] px-5 py-2.5 rounded-xl font-semibold">
                ➕ Ajouter un utilisateur
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mb-6 border-b">
            <button onClick={() => setActiveView("users")} className={`pb-2 px-4 font-medium ${activeView === "users" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>
              👥 Liste des utilisateurs
            </button>
            <button onClick={() => setActiveView("groups")} className={`pb-2 px-4 font-medium ${activeView === "groups" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500"}`}>
              📚 Groupes par formateur
            </button>
          </div>

          {activeView === "users" && (
            <>
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <input type="text" placeholder="🔍 Rechercher..." className="w-full p-3 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-4 text-left">Utilisateur</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Statut</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-500">Aucun utilisateur</td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const isMaster = u.email === MASTER_ADMIN_EMAIL;
                          const isAdminUser = u.is_admin === true;
                          return (
                            <tr key={u.id} className={`border-b hover:bg-gray-50 ${isAdminUser ? "bg-blue-50" : ""}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${isMaster ? "bg-red-500" : isAdminUser ? "bg-yellow-500" : u.user_type === "formateur" ? "bg-purple-500" : "bg-gradient-to-r from-[#1a56db] to-[#76c21f]"}`}>
                                    {u.full_name?.charAt(0).toUpperCase() || (isAdminUser ? "👑" : u.user_type === "formateur" ? "👨‍🏫" : "?")}
                                  </div>
                                  <span>
                                    {u.full_name || "—"}
                                    {isMaster && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">👑 Admin principal</span>}
                                    {isAdminUser && !isMaster && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Admin</span>}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600">{u.email}</td>
                              <td className="p-4">
                                {isAdminUser ? (
                                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">👑 Administrateur</span>
                                ) : u.user_type === "formateur" ? (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">👨‍🏫 Formateur</span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">👨‍🎓 Participant</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${u.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                  {u.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 flex-wrap">
                                  {isMaster ? (
                                    <span className="text-xs text-gray-400 italic">Non modifiable</span>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => toggleApprove(u)} 
                                        disabled={updating === `approve-${u.id}`} 
                                        className={`px-2 py-1 rounded-lg text-white text-xs ${u.is_approved ? "bg-orange-500" : "bg-green-500"} disabled:opacity-50`}
                                      >
                                        {updating === `approve-${u.id}` ? "..." : (u.is_approved ? "⛔ Désapprouver" : "✅ Approuver")}
                                      </button>
                                      {u.user_type === "formateur" && !isAdminUser && (
                                        <button onClick={async () => {
                                          setSelectedFormateur(u);
                                          await fetchFormateurAssignments(u.id);
                                          setShowAssignModal(true);
                                        }} className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs">
                                          📚 Gérer formations
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => deleteUser(u.id, u.email)} 
                                        disabled={updating === `delete-${u.id}`} 
                                        className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs"
                                      >
                                        {updating === `delete-${u.id}` ? "..." : "🗑️ Supprimer"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === "groups" && (
            <div className="space-y-6">
              {loadingFormateurs ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db] mx-auto"></div>
                  <p className="text-gray-500 mt-4">Chargement...</p>
                </div>
              ) : formateursData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p>Aucun formateur</p>
                </div>
              ) : (
                formateursData.map(formateur => {
                  const assignments = assignmentsData[formateur.id] || [];
                  return (
                    <div key={formateur.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                                {formateur.full_name?.charAt(0).toUpperCase() || "👨‍🏫"}
                              </div>
                              <div>
                                <h2 className="text-xl font-bold">{formateur.full_name}</h2>
                                <p className="text-purple-200 text-sm">{formateur.email}</p>
                              </div>
                            </div>
                          </div>
                          <button onClick={async () => {
                            setSelectedFormateur(formateur);
                            await fetchFormateurAssignments(formateur.id);
                            setShowAssignModal(true);
                          }} className="px-3 py-1.5 bg-white/20 rounded-lg text-sm">
                            📚 Assigner formation
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-800 mb-3">📖 Formations assignées ({assignments.length})</h3>
                        {assignments.length === 0 ? (
                          <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">Aucune formation assignée</p>
                        ) : (
                          <div className="space-y-4">
                            {assignments.map(ass => {
                              const f = ass.formations;
                              const dureeRestante = ass.duree_restante || 0;
                              const dureeTotale = f?.duree_totale || 0;
                              const progression = dureeTotale ? ((dureeTotale - dureeRestante) / dureeTotale) * 100 : 0;
                              const nextSeance = nextSeancesData[ass.id];
                              const code = codesMap[ass.formation_id];
                              return (
                                <div key={ass.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-start flex-wrap gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold">{f?.title}</h4>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{ass.groupe_nom}</span>
                                        {code && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Code: {code}</span>}
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                                        <div>
                                          <p className="text-gray-500 text-xs">Durée totale</p>
                                          <p className="font-semibold">{dureeTotale}h</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 text-xs">Durée restante</p>
                                          <p className="font-semibold text-orange-600">{dureeRestante}h</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 text-xs">Progression</p>
                                          <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                              <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${Math.min(progression, 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs">{Math.round(progression)}%</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 text-xs">Prochaine séance</p>
                                          {nextSeance ? (
                                            <p className="text-sm font-medium text-blue-600">{new Date(nextSeance.date_seance).toLocaleDateString()}</p>
                                          ) : (
                                            <p className="text-gray-400">—</p>
                                          )}
                                        </div>
                                      </div>
                                      {ass.horaire && <p className="text-xs text-gray-500 mt-2">📅 {ass.horaire} • {ass.jours || ""}</p>}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <button onClick={async () => {
                                        setSelectedAssignment(ass);
                                        await fetchSeances(ass.id);
                                        setShowSeancesModal(true);
                                      }} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">
                                        📅 Calendrier
                                      </button>
                                      <button onClick={async () => {
                                        setSelectedAssignment(ass);
                                        await fetchGroupParticipants(ass.formation_id);
                                        setShowGroupModal(true);
                                      }} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs">
                                        👥 Participants
                                      </button>
                                      <button onClick={async () => {
                                        setSelectedAssignment(ass);
                                        await fetchAvailableParticipants(ass.formation_id);
                                        setShowAssignParticipantsModal(true);
                                      }} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs">
                                        ➕ Assigner
                                      </button>
                                      <button onClick={() => generateAccessCode(ass.formation_id, f?.title)} disabled={generatingCode} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs">
                                        🎲 Code
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJOUT UTILISATEUR */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold">Ajouter un utilisateur</h3>
                  <button onClick={() => setShowAddModal(false)}>✕</button>
                </div>
              </div>
              <form onSubmit={createUser} className="p-6 space-y-4">
                <input type="text" placeholder="Nom complet" className="w-full border rounded-xl p-3" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} required />
                <input type="email" placeholder="Email" className="w-full border rounded-xl p-3" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                <input type="password" placeholder="Mot de passe (min. 6)" className="w-full border rounded-xl p-3" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} />
                <select className="w-full border rounded-xl p-3" value={newUser.user_type} onChange={e => setNewUser({ ...newUser, user_type: e.target.value })}>
                  <option value="participant">👨‍🎓 Participant</option>
                  <option value="formateur">👨‍🏫 Formateur</option>
                  <option value="admin">👑 Administrateur</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newUser.is_approved} onChange={e => setNewUser({ ...newUser, is_approved: e.target.checked })} />
                  <span>✅ Approuvé immédiatement</span>
                </label>
                <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold">
                  {creating ? "Création..." : "➕ Créer l'utilisateur"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ASSIGNATION FORMATIONS */}
      <AnimatePresence>
        {showAssignModal && selectedFormateur && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAssignModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">📚 Gérer les formations</h3>
                    <p className="text-blue-100 text-sm">{selectedFormateur.full_name} ({selectedFormateur.email})</p>
                  </div>
                  <button onClick={() => setShowAssignModal(false)}>✕</button>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">📋 Formations assignées</h4>
                {loadingAssignments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
                  </div>
                ) : assignedFormations.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">Aucune formation assignée</p>
                ) : (
                  assignedFormations.map(ass => (
                    <div key={ass.id} className="bg-gray-50 rounded-lg p-4 border mb-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold">{ass.formations?.title}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                            <p><span className="text-gray-500">Groupe:</span> {ass.groupe_nom}</p>
                            <p><span className="text-gray-500">Horaire:</span> {ass.horaire || "—"}</p>
                            <p><span className="text-gray-500">Jours:</span> {ass.jours || "—"}</p>
                            <p><span className="text-gray-500">Date début:</span> {ass.date_debut ? new Date(ass.date_debut).toLocaleDateString() : "—"}</p>
                            <p><span className="text-gray-500">Date fin:</span> {ass.date_fin ? new Date(ass.date_fin).toLocaleDateString() : "—"}</p>
                            <p><span className="text-gray-500">Durée totale:</span> {ass.formations?.duree_totale || 0}h</p>
                            <p className="col-span-2">
                              <span className="text-gray-500 font-semibold">Durée restante:</span>
                              <input type="number" value={ass.duree_restante || 0} onChange={e => updateDureeRestante(ass.id, parseInt(e.target.value) || 0)} className="w-24 ml-2 border rounded px-2 py-1 text-center" min="0" /> heures
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            setSelectedAssignment(ass);
                            await fetchSeances(ass.id);
                            setShowSeancesModal(true);
                          }} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">
                            📅 Calendrier
                          </button>
                          <button onClick={() => removeAssignment(ass.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs">
                            🗑️ Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <h4 className="font-semibold mt-6 mb-3">➕ Assigner nouvelle formation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <select className="border rounded-lg p-2" value={newAssignment.formation_id} onChange={e => setNewAssignment({ ...newAssignment, formation_id: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {formations.map(f => <option key={f.id} value={f.id}>{f.title} ({f.duree_totale || 0}h)</option>)}
                  </select>
                  <input type="text" placeholder="Nom du groupe *" className="border rounded-lg p-2" value={newAssignment.groupe_nom} onChange={e => setNewAssignment({ ...newAssignment, groupe_nom: e.target.value })} />
                  <input type="text" placeholder="Horaire" className="border rounded-lg p-2" value={newAssignment.horaire} onChange={e => setNewAssignment({ ...newAssignment, horaire: e.target.value })} />
                  <input type="text" placeholder="Jours" className="border rounded-lg p-2" value={newAssignment.jours} onChange={e => setNewAssignment({ ...newAssignment, jours: e.target.value })} />
                  <input type="date" className="border rounded-lg p-2" value={newAssignment.date_debut} onChange={e => setNewAssignment({ ...newAssignment, date_debut: e.target.value })} />
                  <input type="date" className="border rounded-lg p-2" value={newAssignment.date_fin} onChange={e => setNewAssignment({ ...newAssignment, date_fin: e.target.value })} />
                </div>
                <button onClick={addAssignment} disabled={assigning} className="w-full bg-green-600 text-white py-2 rounded-lg">
                  {assigning ? "Assignation..." : "➕ Assigner"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CALENDRIER / SÉANCES */}
      <AnimatePresence>
        {showSeancesModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowSeancesModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">📅 Calendrier des séances</h3>
                    <p className="text-blue-100 text-sm">{selectedAssignment.formations?.title} - {selectedAssignment.groupe_nom}</p>
                  </div>
                  <button onClick={() => setShowSeancesModal(false)}>✕</button>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">Séances planifiées</h4>
                {loadingSeances ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
                  </div>
                ) : seances.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">Aucune séance</p>
                ) : (
                  seances.map(s => {
                    let statutClass = "bg-blue-100 text-blue-700";
                    let statutText = "📅 Planifiée";
                    if (s.statut === "en_cours") {
                      statutClass = "bg-green-100 text-green-700";
                      statutText = "🟢 En cours";
                    } else if (s.statut === "termine") {
                      statutClass = "bg-gray-100 text-gray-700";
                      statutText = "✅ Terminée";
                    } else if (s.statut === "annule") {
                      statutClass = "bg-red-100 text-red-700";
                      statutText = "❌ Annulée";
                    }
                    return (
                      <div key={s.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <p className="font-medium">{s.titre}</p>
                          <p className="text-xs text-gray-500">{new Date(s.date_heure).toLocaleString()} - Durée: {s.duree} min</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statutClass}`}>{statutText}</span>
                        </div>
                        <div className="flex gap-2">
                          <select value={s.statut} onChange={e => updateSeanceStatut(s.id, e.target.value)} className="text-xs border rounded px-2 py-1">
                            <option value="planifie">📅 Planifiée</option>
                            <option value="en_cours">🟢 En cours</option>
                            <option value="termine">✅ Terminée</option>
                            <option value="annule">❌ Annulée</option>
                          </select>
                          <button onClick={() => deleteSeance(s.id)} className="text-red-500 text-sm">🗑️</button>
                        </div>
                      </div>
                    );
                  })
                )}
                <h4 className="font-semibold mt-6 mb-3">➕ Ajouter une séance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" placeholder="Titre" className="border rounded-lg p-2" value={newSeance.titre} onChange={e => setNewSeance({ ...newSeance, titre: e.target.value })} />
                  <input type="datetime-local" className="border rounded-lg p-2" value={newSeance.date_heure} onChange={e => setNewSeance({ ...newSeance, date_heure: e.target.value })} />
                  <input type="number" placeholder="Durée (minutes)" className="border rounded-lg p-2" value={newSeance.duree} onChange={e => setNewSeance({ ...newSeance, duree: parseInt(e.target.value) || 60 })} />
                </div>
                <button onClick={addSeance} disabled={addingSeance} className="w-full bg-blue-600 text-white py-2 rounded-lg">
                  {addingSeance ? "Ajout..." : "➕ Ajouter"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL VOIR PARTICIPANTS */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGroupModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-t-2xl sticky top-0">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold">👥 Participants inscrits</h3>
                  <button onClick={() => setShowGroupModal(false)}>✕</button>
                </div>
              </div>
              <div className="p-6">
                {loadingParticipants ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
                  </div>
                ) : groupParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun participant</p>
                ) : (
                  groupParticipants.map(ins => (
                    <div key={ins.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                          {ins.users?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium">{ins.users?.full_name || "—"}</p>
                          <p className="text-xs text-gray-500">{ins.users?.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${ins.users?.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {ins.users?.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ASSIGNER PARTICIPANTS */}
      <AnimatePresence>
        {showAssignParticipantsModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAssignParticipantsModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl sticky top-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">👥 Assigner des participants</h3>
                    <p className="text-purple-200 text-sm">{selectedAssignment.formations?.title} - {selectedAssignment.groupe_nom}</p>
                  </div>
                  <button onClick={() => setShowAssignParticipantsModal(false)}>✕</button>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">✅ Participants assignés ({assignedParticipantsList.length})</h4>
                {assignedParticipantsList.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg mb-4">Aucun</p>
                ) : (
                  assignedParticipantsList.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">{p.full_name?.charAt(0).toUpperCase() || "?"}</div>
                        <div>
                          <p className="font-medium">{p.full_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                      <button onClick={() => removeParticipantFromFormation(selectedAssignment.formation_id, p.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs">
                        Retirer
                      </button>
                    </div>
                  ))
                )}
                <h4 className="font-semibold mt-6 mb-3">📋 Participants disponibles ({availableParticipants.length})</h4>
                {loadingAvailableParticipants ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56db]"></div>
                  </div>
                ) : availableParticipants.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">Aucun disponible</p>
                ) : (
                  availableParticipants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">{p.full_name?.charAt(0).toUpperCase() || "?"}</div>
                        <div>
                          <p className="font-medium">{p.full_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                      <button onClick={() => assignParticipantToFormation(selectedAssignment.formation_id, p.id)} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs">
                        Assigner
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CODE */}
      <AnimatePresence>
        {showCodeModal && selectedFormationForCode && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCodeModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-t-2xl">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">🎲 Code d'accès</h3>
                    <p className="text-yellow-100 text-sm">{selectedFormationForCode.title}</p>
                  </div>
                  <button onClick={() => setShowCodeModal(false)}>✕</button>
                </div>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-3">Code à communiquer au formateur :</p>
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <p className="text-4xl font-bold tracking-wider">{generatedCode}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success("Code copié"); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg">
                    📋 Copier
                  </button>
                  <button onClick={() => setShowCodeModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg">
                    Fermer
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Le formateur devra saisir ce code pour démarrer une session</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminUsers;