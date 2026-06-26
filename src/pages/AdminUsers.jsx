// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase, supabaseAdmin } from "../supabaseClient";
import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "../supabaseFetch";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

const MASTER_ADMIN_EMAIL = "admin@certus.tn";

const AdminUsers = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const initialFetchDone = useRef(false);
  const isMounted = useRef(true);

  // ============ ÉTATS ============
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [updating, setUpdating] = useState(null);

  // MODALS
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSeancesModal, setShowSeancesModal] = useState(false);
  const [showAssignParticipantsModal, setShowAssignParticipantsModal] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // GROUPE
  const [newAssignment, setNewAssignment] = useState({
    formation_id: "",
    groupe_nom: "",
    horaire: "",
    jours: "",
    date_debut: "",
    date_fin: ""
  });
  const [assigning, setAssigning] = useState(false);

  // GROUPES
  const [groupesData, setGroupesData] = useState([]);
  const [loadingGroupes, setLoadingGroupes] = useState(false);

  // PARTICIPANTS
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [loadingAvailableParticipants, setLoadingAvailableParticipants] = useState(false);

  // SÉANCES
  const [seances, setSeances] = useState([]);
  const [loadingSeances, setLoadingSeances] = useState(false);
  const [newSeance, setNewSeance] = useState({
    titre: "",
    date_heure: "",
    duree: 60,
    lien_reunion: ""
  });
  const [addingSeance, setAddingSeance] = useState(false);

  // INSCRIPTIONS
  const [inscriptionsEnAttente, setInscriptionsEnAttente] = useState([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
  const [selectedGroupeId, setSelectedGroupeId] = useState({});
  const [validatingInscription, setValidatingInscription] = useState(false);

  // DEMANDES PRÉSENTIEL
  const [demandesPresentiel, setDemandesPresentiel] = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);

  // CODES
  const [codesMap, setCodesMap] = useState({});
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedFormationForCode, setSelectedFormationForCode] = useState(null);

  // NOUVEL UTILISATEUR - AMÉLIORÉ AVEC FORMATION
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "participant",
    is_approved: true,
    formation_id: "" // ✅ AJOUT : formation pour le participant
  });
  const [creating, setCreating] = useState(false);
  const [formationSearchTerm, setFormationSearchTerm] = useState("");

  // ============ FETCH FUNCTIONS ============
  const fetchUsers = useCallback(async () => {
    if (!isMounted.current) return;
    setLoadingUsers(true);
    try {
      const data = await supabaseSelect("users", "order=created_at.desc");
      if (isMounted.current) {
        const sorted = (data || []).sort((a, b) => {
          if (a.email === MASTER_ADMIN_EMAIL) return -1;
          if (b.email === MASTER_ADMIN_EMAIL) return 1;
          if (a.is_admin && !b.is_admin) return -1;
          if (!a.is_admin && b.is_admin) return 1;
          return 0;
        });
        setUsers(sorted);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement utilisateurs");
    } finally {
      if (isMounted.current) setLoadingUsers(false);
    }
  }, []);

  const fetchFormationsList = useCallback(async () => {
    try {
      const data = await supabaseSelect("formations", "select=id,title,duration,is_online,on_demand");
      if (isMounted.current) setFormations(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInscriptionsEnAttente = useCallback(async () => {
    if (!isMounted.current) return;
    setLoadingInscriptions(true);
    try {
      const data = await supabaseSelect("inscriptions",
        "select=*,users:user_id(id,email,full_name,display_name),formations:formation_id(id,title,is_online,on_demand)&statut=eq.en_attente&order=created_at.asc"
      );
      if (isMounted.current) {
        setInscriptionsEnAttente((data || []).filter(ins => ins.formations?.is_online === true));
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement inscriptions");
    } finally {
      if (isMounted.current) setLoadingInscriptions(false);
    }
  }, []);

  const fetchDemandesPresentiel = useCallback(async () => {
    if (!isMounted.current) return;
    setLoadingDemandes(true);
    try {
      const data = await supabaseSelect("demandes_presentiel",
        "select=*,formations:formation_id(id,title,is_online,on_demand)&statut=eq.nouvelle&order=created_at.asc"
      );
      if (isMounted.current) setDemandesPresentiel(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement demandes");
    } finally {
      if (isMounted.current) setLoadingDemandes(false);
    }
  }, []);

  const fetchGroupes = useCallback(async () => {
    if (!isMounted.current) return;
    setLoadingGroupes(true);
    try {
      const groupes = await supabaseSelect("groupes_formation", `
        select=*,
        formations:formation_id(id,title,duration,description,is_online),
        formateur:formateur_id(id,email,full_name,display_name,user_type)
      `);
      
      if (!groupes || groupes.length === 0) {
        if (isMounted.current) setGroupesData([]);
        setLoadingGroupes(false);
        return;
      }

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
      
      if (isMounted.current) setGroupesData(groupesAvecParticipants);

      const { data: codes } = await supabase
        .from("formation_access_codes")
        .select("formation_id, access_code");
        
      if (codes && isMounted.current) {
        const cmap = {};
        codes.forEach(c => { cmap[c.formation_id] = c.access_code; });
        setCodesMap(cmap);
      }
    } catch (err) {
      console.error("Erreur fetchGroupes:", err);
      toast.error("Erreur chargement groupes");
    } finally {
      if (isMounted.current) setLoadingGroupes(false);
    }
  }, []);

  // ✅ AMÉLIORÉ : récupère les participants disponibles avec leur formation
  const fetchAvailableParticipantsForGroup = useCallback(async (groupeId, formationId) => {
    setLoadingAvailableParticipants(true);
    try {
      // Récupérer tous les participants
      const all = await supabaseSelect("users", 
        "select=id,email,full_name,display_name,is_approved&user_type=eq.participant&is_admin=eq.false"
      );
      
      // Récupérer les inscriptions existantes pour cette formation
      const existing = await supabaseSelect("inscriptions", 
        `select=user_id&formation_id=eq.${formationId}&statut=eq.confirme`
      );
      
      const assignedIds = new Set(existing.map(ins => ins.user_id));
      
      // Récupérer les formations des participants disponibles
      const availableUsers = all.filter(p => !assignedIds.has(p.id));
      
      // Pour chaque participant, récupérer sa formation actuelle (si inscrit ailleurs)
      const userFormations = {};
      if (availableUsers.length > 0) {
        const userIds = availableUsers.map(u => u.id);
        const { data: userInscriptions } = await supabase
          .from('inscriptions')
          .select('user_id, formation_id, formations:formation_id(title)')
          .in('user_id', userIds)
          .eq('statut', 'confirme');
          
        if (userInscriptions) {
          userInscriptions.forEach(ins => {
            userFormations[ins.user_id] = ins.formations?.title || 'Formation inconnue';
          });
        }
      }
      
      // Ajouter la formation à chaque participant
      const availableWithFormation = availableUsers.map(user => ({
        ...user,
        formation_actuelle: userFormations[user.id] || 'Aucune formation'
      }));
      
      if (isMounted.current) {
        setAvailableParticipants(availableWithFormation);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement participants");
    } finally {
      if (isMounted.current) setLoadingAvailableParticipants(false);
    }
  }, []);

  const fetchGroupParticipants = useCallback(async (groupeId) => {
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
        
      if (isMounted.current) {
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
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement participants");
    } finally {
      if (isMounted.current) setLoadingParticipants(false);
    }
  }, []);

  const fetchSeances = useCallback(async (assignmentId) => {
    if (!isMounted.current) return;
    setLoadingSeances(true);
    try {
      const data = await supabaseSelect("seances", `assignment_id=eq.${assignmentId}&order=date_seance.asc`);
      if (isMounted.current) setSeances(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement séances");
    } finally {
      if (isMounted.current) setLoadingSeances(false);
    }
  }, []);

  // ============ ACTIONS UTILISATEURS ============
  // ✅ AMÉLIORÉ : création d'utilisateur avec formation
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
        user_metadata: { 
          full_name: newUser.full_name, 
          user_type: newUser.user_type 
        }
      });
      
      if (authError) {
        toast.error(authError.message.includes("already been registered") ? `Email ${newUser.email} existe déjà` : "Erreur Auth");
        setCreating(false);
        return;
      }
      
      const isAdminUser = newUser.user_type === "admin";
      
      // Insérer l'utilisateur
      const { error: insertError } = await supabase
        .from("users")
        .upsert({
          id: authData.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          user_type: isAdminUser ? "admin" : newUser.user_type,
          is_admin: isAdminUser,
          is_approved: newUser.is_approved,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (insertError) throw insertError;

      // ✅ Si participant et formation sélectionnée, créer l'inscription
      if (newUser.user_type === "participant" && newUser.formation_id) {
        const { error: insError } = await supabase
          .from("inscriptions")
          .insert({
            user_id: authData.user.id,
            formation_id: newUser.formation_id,
            statut: "confirme",
            created_at: new Date().toISOString()
          });
          
        if (insError) {
          console.error("Erreur inscription:", insError);
          toast.warning("⚠️ Utilisateur créé mais inscription à la formation échouée");
        } else {
          toast.success(`✅ Inscrit à la formation sélectionnée`);
        }
      }

      toast.success(`✅ ${isAdminUser ? "Administrateur" : "Utilisateur"} ${newUser.email} créé`);
      setShowAddModal(false);
      setNewUser({
        email: "", 
        password: "", 
        full_name: "", 
        user_type: "participant", 
        is_approved: true,
        formation_id: ""
      });
      await fetchUsers();
      await fetchGroupes();
      await fetchInscriptionsEnAttente();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur création");
    } finally {
      setCreating(false);
    }
  };

  const toggleApprove = useCallback(async (user) => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  }, []);

  const deleteUser = useCallback(async (id, email) => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setUpdating(null);
    }
  }, []);

  // ============ ACTIONS GROUPES ============
  const addAssignment = useCallback(async () => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setAssigning(false);
    }
  }, [newAssignment, selectedFormateur, fetchGroupes]);

  const removeAssignment = useCallback(async (groupId) => {
    if (!window.confirm("Retirer ce groupe ?")) return;
    try {
      await supabaseDelete("groupes_formation", groupId);
      toast.success("Groupe retiré");
      await fetchGroupes();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    }
  }, [fetchGroupes]);

  const assignParticipantToGroup = useCallback(async (groupeId, formationId, userId) => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur assignation");
    }
  }, [selectedGroup, fetchGroupes, fetchGroupParticipants]);

  const removeParticipantFromGroup = useCallback(async (inscriptionId) => {
    if (!window.confirm("Retirer ce participant ?")) return;
    try {
      await supabaseDelete("inscriptions", inscriptionId);
      toast.success("✅ Participant retiré");
      await fetchGroupes();
      if (selectedGroup) await fetchGroupParticipants(selectedGroup.id);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    }
  }, [selectedGroup, fetchGroupes, fetchGroupParticipants]);

  // ============ ACTIONS SÉANCES ============
  const addSeance = useCallback(async () => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setAddingSeance(false);
    }
  }, [newSeance, selectedAssignment, fetchSeances]);

  const deleteSeance = useCallback(async (seanceId) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await supabaseDelete("seances", seanceId);
      toast.success("Séance supprimée");
      await fetchSeances(selectedAssignment.id);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    }
  }, [selectedAssignment, fetchSeances]);

  const genererLienJitsi = useCallback(() => {
    const nomSalle = `certus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setNewSeance(prev => ({ ...prev, lien_reunion: `https://meet.jit.si/${nomSalle}` }));
    toast.success("🔗 Lien Jitsi généré");
  }, []);

  // ============ ACTIONS INSCRIPTIONS ============
  const validerInscription = useCallback(async (inscriptionId, formationId, userId, groupeId) => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setValidatingInscription(false);
    }
  }, [fetchInscriptionsEnAttente, fetchGroupes]);

  const marquerDemandeContactee = useCallback(async (demandeId) => {
    try {
      await supabaseUpdate("demandes_presentiel", demandeId, {
        statut: "contacte",
        contacte_le: new Date().toISOString()
      });
      toast.success("✅ Demandeur contacté");
      await fetchDemandesPresentiel();
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    }
  }, [fetchDemandesPresentiel]);

  // ============ ACTIONS CODES ============
  const generateAccessCode = useCallback(async (formationId, formationTitle) => {
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
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur");
    } finally {
      setGeneratingCode(false);
    }
  }, [fetchGroupes]);

  // ============ INITIALISATION ============
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
  }, [isAdmin, fetchUsers, fetchFormationsList, fetchInscriptionsEnAttente, fetchDemandesPresentiel, fetchGroupes]);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les formations pour le select
  const filteredFormations = formations.filter(f =>
    f.title?.toLowerCase().includes(formationSearchTerm.toLowerCase())
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]" aria-label="Chargement en cours"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin - Gestion | Centre Certus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">⚙️ Administration</h1>
                <p className="text-blue-100 mt-1">Gérez les utilisateurs, groupes, inscriptions et formations</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-white text-[#1a56db] px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
                aria-label="Ajouter un utilisateur"
              >
                ➕ Ajouter un utilisateur
              </button>
            </div>
          </div>

          {/* Statistiques */}
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

          {/* Onglets */}
          <div className="flex gap-4 mb-6 border-b flex-wrap" role="tablist">
            <button 
              role="tab"
              aria-selected={activeTab === "users"}
              onClick={() => setActiveTab("users")} 
              className={`pb-2 px-4 font-medium transition ${activeTab === "users" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500 hover:text-gray-700"}`}
            >
              👥 Utilisateurs ({users.length})
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === "inscriptions"}
              onClick={() => setActiveTab("inscriptions")} 
              className={`pb-2 px-4 font-medium transition ${activeTab === "inscriptions" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500 hover:text-gray-700"}`}
            >
              📝 Inscriptions en attente ({inscriptionsEnAttente.length})
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === "demandes"}
              onClick={() => setActiveTab("demandes")} 
              className={`pb-2 px-4 font-medium transition ${activeTab === "demandes" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500 hover:text-gray-700"}`}
            >
              📋 Demandes présentiel ({demandesPresentiel.length})
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === "groupes"}
              onClick={() => setActiveTab("groupes")} 
              className={`pb-2 px-4 font-medium transition ${activeTab === "groupes" ? "border-b-2 border-[#1a56db] text-[#1a56db]" : "text-gray-500 hover:text-gray-700"}`}
            >
              👨‍🏫 Groupes ({groupesData.length})
            </button>
          </div>

          {/* ==================== VUE UTILISATEURS ==================== */}
          {activeTab === "users" && (
            <>
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <label htmlFor="search-users" className="sr-only">Rechercher des utilisateurs</label>
                <input 
                  id="search-users"
                  type="text" 
                  placeholder="🔍 Rechercher par nom ou email..." 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Liste des utilisateurs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-4 text-left">Utilisateur</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Formation</th>
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
                        
                        // Récupérer la formation de l'utilisateur
                        let userFormation = "Aucune";
                        if (!isAdminUser && u.user_type !== "formateur") {
                          const formation = groupesData
                            .filter(g => g.participants?.some(p => p.user_id === u.id))
                            .map(g => g.formations?.title)
                            .filter(Boolean);
                          userFormation = formation.length > 0 ? formation.join(", ") : "Aucune";
                        } else if (u.user_type === "formateur") {
                          userFormation = "Formateur (non assigné)";
                          const assigned = groupesData.filter(g => g.formateur_id === u.id);
                          if (assigned.length > 0) {
                            userFormation = assigned.map(g => g.formations?.title).filter(Boolean).join(", ");
                          }
                        }
                        
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
                            <td className="p-4 max-w-[200px]">
                              <span className="text-xs truncate block" title={userFormation}>
                                {userFormation}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {u.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                              </span>
                            </td>
                            <td className="p-4">
                              {!isMaster && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => toggleApprove(u)} 
                                    className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                                    aria-label={u.is_approved ? "Désapprouver" : "Approuver"}
                                  >
                                    {u.is_approved ? "⛔ Désapprouver" : "✅ Approuver"}
                                  </button>
                                  <button 
                                    onClick={() => deleteUser(u.id, u.email)} 
                                    className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition"
                                    aria-label={`Supprimer ${u.email}`}
                                  >
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
                <p className="text-sm text-gray-500">Validez les inscriptions des participants aux formations en ligne</p>
              </div>
              {loadingInscriptions ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
                </div>
              ) : inscriptionsEnAttente.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune inscription en attente</div>
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
                              <p className="font-medium">{ins.users?.full_name || ins.users?.display_name || "—"}</p>
                              <p className="text-xs text-gray-500">{ins.users?.email}</p>
                            </td>
                            <td className="p-4">{ins.formations?.title}</td>
                            <td className="p-4 text-gray-500">{new Date(ins.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <select
                                className="border rounded-lg px-3 py-1 text-sm w-44 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                                value={selectedGroupeId[ins.id] || ""}
                                onChange={(e) => setSelectedGroupeId(prev => ({ ...prev, [ins.id]: e.target.value }))}
                                aria-label="Sélectionner un groupe"
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
                                disabled={!selectedGroupeId[ins.id] || validatingInscription}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition disabled:opacity-50"
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

          {/* ==================== VUE DEMANDES PRÉSENTIEL ==================== */}
          {activeTab === "demandes" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-800">📋 Demandes présentiel</h2>
                <p className="text-sm text-gray-500">Gérez les demandes d'inscription en présentiel</p>
              </div>
              {loadingDemandes ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
                </div>
              ) : demandesPresentiel.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune demande présentiel</div>
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
                              <a 
                                href={`tel:${d.telephone}`} 
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition"
                                aria-label={`Appeler ${d.nom}`}
                              >
                                📞
                              </a>
                              <a 
                                href={`mailto:${d.email}`} 
                                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition"
                                aria-label={`Envoyer un email à ${d.nom}`}
                              >
                                ✉️
                              </a>
                              <button 
                                onClick={() => marquerDemandeContactee(d.id)} 
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                                aria-label="Marquer comme contacté"
                              >
                                ✅
                              </button>
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
                  <p className="mt-3 text-gray-500">Chargement des groupes...</p>
                </div>
              ) : groupesData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500">Aucun groupe créé</p>
                  <p className="text-sm text-gray-400 mt-2">Créez un groupe via "Assigner formation" ci-dessous</p>
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
                            {groupe.horaire && (
                              <p className="text-purple-200 text-xs mt-1">📅 {groupe.horaire} • {groupe.jours || ""}</p>
                            )}
                            {codesMap[groupe.formation_id] && (
                              <p className="text-purple-200 text-xs mt-1">🔑 Code: {codesMap[groupe.formation_id]}</p>
                            )}
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
                                        aria-label={`Retirer ${displayName}`}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center border border-dashed">
                              <p className="text-sm text-gray-400">Aucun participant assigné</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                          <button
                            onClick={async () => { 
                              setSelectedAssignment(groupe); 
                              await fetchSeances(groupe.id); 
                              setShowSeancesModal(true); 
                            }}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            📅 Gérer séances
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedGroup(groupe);
                              await fetchAvailableParticipantsForGroup(groupe.id, groupe.formation_id);
                              await fetchGroupParticipants(groupe.id);
                              setShowAssignParticipantsModal(true);
                            }}
                            className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition"
                          >
                            ➕ Assigner participants
                          </button>
                          <button
                            onClick={() => generateAccessCode(groupe.formation_id, groupe.formations?.title)}
                            disabled={generatingCode}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition disabled:opacity-50"
                          >
                            🎲 Générer code
                          </button>
                          <button
                            onClick={() => removeAssignment(groupe.id)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            🗑️ Retirer groupe
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
                  {users.filter(u => u.user_type === "formateur" && !u.is_admin).length === 0 ? (
                    <p className="text-gray-500">Aucun formateur disponible</p>
                  ) : (
                    users.filter(u => u.user_type === "formateur" && !u.is_admin).map(f => (
                      <button
                        key={f.id}
                        onClick={() => { setSelectedFormateur(f); setShowAssignModal(true); }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                      >
                        + {f.full_name || f.email?.split("@")[0]}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ MODAL AJOUT UTILISATEUR ============ */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
            onClick={() => setShowAddModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
          >
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl flex justify-between items-center sticky top-0">
                <h3 id="add-user-title" className="text-xl font-bold">➕ Ajouter un utilisateur</h3>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="text-white hover:text-gray-200 text-xl"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={createUser} className="p-6 space-y-4">
                <div>
                  <label htmlFor="new-user-name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input 
                    id="new-user-name"
                    type="text" 
                    placeholder="Nom complet" 
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                    value={newUser.full_name} 
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="new-user-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    id="new-user-email"
                    type="email" 
                    placeholder="Email" 
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                    value={newUser.email} 
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="new-user-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (min. 6) *</label>
                  <input 
                    id="new-user-password"
                    type="password" 
                    placeholder="Mot de passe" 
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                    value={newUser.password} 
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                    required 
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="new-user-type" className="block text-sm font-medium text-gray-700 mb-1">Type d'utilisateur *</label>
                  <select 
                    id="new-user-type"
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                    value={newUser.user_type} 
                    onChange={e => setNewUser({ ...newUser, user_type: e.target.value })}
                  >
                    <option value="participant">👨‍🎓 Participant</option>
                    <option value="formateur">👨‍🏫 Formateur</option>
                    <option value="admin">👑 Administrateur</option>
                  </select>
                </div>
                
                {/* ✅ AJOUT : Sélection de formation pour participant */}
                {newUser.user_type === "participant" && (
                  <div>
                    <label htmlFor="new-user-formation" className="block text-sm font-medium text-gray-700 mb-1">
                      🎓 Formation (optionnel)
                    </label>
                    <div className="relative">
                      <input
                        id="new-user-formation-search"
                        type="text"
                        placeholder="Rechercher une formation..."
                        className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                        value={formationSearchTerm}
                        onChange={(e) => setFormationSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      id="new-user-formation"
                      className="w-full border rounded-xl p-3 mt-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                      value={newUser.formation_id}
                      onChange={(e) => setNewUser({ ...newUser, formation_id: e.target.value })}
                    >
                      <option value="">Aucune formation</option>
                      {filteredFormations.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.title} {f.is_online ? "🌍" : f.on_demand ? "🏢" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Sélectionnez une formation pour inscrire automatiquement le participant
                    </p>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newUser.is_approved} 
                    onChange={e => setNewUser({ ...newUser, is_approved: e.target.checked })} 
                  /> 
                  ✅ Approuvé
                </label>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition"
                >
                  {creating ? "Création..." : "➕ Créer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ MODAL CRÉATION GROUPE ============ */}
      <AnimatePresence>
        {showAssignModal && selectedFormateur && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" 
            onClick={() => setShowAssignModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0 flex justify-between items-center">
                <div>
                  <h3 id="assign-modal-title" className="text-xl font-bold">📚 Créer un groupe</h3>
                  <p className="text-blue-100 text-sm">Formateur: {selectedFormateur.full_name}</p>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="text-white hover:text-gray-200 text-xl"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label htmlFor="assign-formation" className="block text-sm font-medium text-gray-700 mb-1">Formation *</label>
                    <select 
                      id="assign-formation"
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.formation_id} 
                      onChange={e => setNewAssignment({ ...newAssignment, formation_id: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assign-group-name" className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe *</label>
                    <input 
                      id="assign-group-name"
                      type="text" 
                      placeholder="Nom du groupe" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.groupe_nom} 
                      onChange={e => setNewAssignment({ ...newAssignment, groupe_nom: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-horaire" className="block text-sm font-medium text-gray-700 mb-1">Horaire</label>
                    <input 
                      id="assign-horaire"
                      type="text" 
                      placeholder="Horaire" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.horaire} 
                      onChange={e => setNewAssignment({ ...newAssignment, horaire: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-jours" className="block text-sm font-medium text-gray-700 mb-1">Jours</label>
                    <input 
                      id="assign-jours"
                      type="text" 
                      placeholder="Jours" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.jours} 
                      onChange={e => setNewAssignment({ ...newAssignment, jours: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-date-debut" className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                    <input 
                      id="assign-date-debut"
                      type="date" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.date_debut} 
                      onChange={e => setNewAssignment({ ...newAssignment, date_debut: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-date-fin" className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                    <input 
                      id="assign-date-fin"
                      type="date" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newAssignment.date_fin} 
                      onChange={e => setNewAssignment({ ...newAssignment, date_fin: e.target.value })} 
                    />
                  </div>
                </div>
                <button 
                  onClick={addAssignment} 
                  disabled={assigning} 
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {assigning ? "Création..." : "➕ Créer le groupe"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ MODAL SÉANCES ============ */}
      <AnimatePresence>
        {showSeancesModal && selectedAssignment && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" 
            onClick={() => setShowSeancesModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="seances-modal-title"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl sticky top-0 flex justify-between items-center">
                <div>
                  <h3 id="seances-modal-title" className="text-xl font-bold">📅 Séances</h3>
                  <p className="text-blue-100 text-sm">{selectedAssignment.formations?.title}</p>
                </div>
                <button 
                  onClick={() => setShowSeancesModal(false)} 
                  className="text-white hover:text-gray-200 text-xl"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-3">Séances existantes</h4>
                {loadingSeances ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56db]"></div>
                  </div>
                ) : seances.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune séance</p>
                ) : (
                  seances.map(s => (
                    <div key={s.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{s.titre}</p>
                          <p className="text-xs text-gray-500">{new Date(s.date_seance).toLocaleString()} - {s.duree} min</p>
                          {s.lien_reunion && (
                            <a 
                              href={s.lien_reunion} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-blue-600 hover:underline break-all"
                            >
                              🔗 {s.lien_reunion}
                            </a>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteSeance(s.id)} 
                          className="text-red-500 text-sm px-2 hover:text-red-700"
                          aria-label={`Supprimer la séance ${s.titre}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <h4 className="font-semibold mt-4 mb-3">➕ Ajouter une séance</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="seance-title" className="sr-only">Titre de la séance</label>
                    <input 
                      id="seance-title"
                      type="text" 
                      placeholder="Titre de la séance" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newSeance.titre} 
                      onChange={e => setNewSeance({ ...newSeance, titre: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="seance-datetime" className="sr-only">Date et heure</label>
                    <input 
                      id="seance-datetime"
                      type="datetime-local" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newSeance.date_heure} 
                      onChange={e => setNewSeance({ ...newSeance, date_heure: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label htmlFor="seance-duration" className="sr-only">Durée (minutes)</label>
                    <input 
                      id="seance-duration"
                      type="number" 
                      placeholder="Durée (minutes)" 
                      className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                      value={newSeance.duree} 
                      onChange={e => setNewSeance({ ...newSeance, duree: parseInt(e.target.value) || 60 })} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor="seance-link" className="sr-only">Lien Jitsi / Zoom / Meet</label>
                      <input 
                        id="seance-link"
                        type="text" 
                        placeholder="Lien Jitsi / Zoom / Meet" 
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-[#1a56db] focus:border-transparent" 
                        value={newSeance.lien_reunion} 
                        onChange={e => setNewSeance({ ...newSeance, lien_reunion: e.target.value })} 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={genererLienJitsi} 
                      className="bg-gray-200 text-gray-700 px-3 rounded-lg text-sm hover:bg-gray-300 transition"
                      aria-label="Générer un lien Jitsi"
                    >
                      🎲 Jitsi
                    </button>
                  </div>
                  <button 
                    onClick={addSeance} 
                    disabled={addingSeance} 
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {addingSeance ? "Ajout..." : "➕ Ajouter la séance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ MODAL ASSIGNER PARTICIPANTS ============ */}
      <AnimatePresence>
        {showAssignParticipantsModal && selectedGroup && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" 
            onClick={() => setShowAssignParticipantsModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-participants-title"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h3 id="assign-participants-title" className="text-xl font-bold">👥 Assigner des participants</h3>
                  <p className="text-purple-200 text-sm">{selectedGroup.formations?.title} - {selectedGroup.nom}</p>
                </div>
                <button 
                  onClick={() => setShowAssignParticipantsModal(false)} 
                  className="text-white hover:text-gray-200 text-xl"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                {/* Participants actuels */}
                <h4 className="font-semibold mb-3">✅ Actuels ({groupParticipants.length})</h4>
                {loadingParticipants ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : groupParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-2 text-sm">Aucun participant assigné</p>
                ) : (
                  <div className="space-y-2">
                    {groupParticipants.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="font-medium">{p.full_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                        <button 
                          onClick={() => removeParticipantFromGroup(p.id)} 
                          className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                          aria-label={`Retirer ${p.full_name}`}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Participants disponibles AVEC leur formation */}
                <h4 className="font-semibold mt-4 mb-3">📋 Disponibles ({availableParticipants.length})</h4>
                {loadingAvailableParticipants ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : availableParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-2 text-sm">Aucun participant disponible</p>
                ) : (
                  <div className="space-y-2">
                    {availableParticipants.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{p.full_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                          <p className="text-xs text-blue-600 truncate mt-0.5">
                            📚 {p.formation_actuelle || 'Aucune formation'}
                          </p>
                        </div>
                        <button 
                          onClick={() => assignParticipantToGroup(selectedGroup.id, selectedGroup.formation_id, p.id)} 
                          className="ml-2 px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition whitespace-nowrap"
                          aria-label={`Assigner ${p.full_name}`}
                        >
                          Assigner
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ MODAL CODE ============ */}
      <AnimatePresence>
        {showCodeModal && selectedFormationForCode && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
            onClick={() => setShowCodeModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="code-modal-title"
          >
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h3 id="code-modal-title" className="text-xl font-bold">🎲 Code d'accès</h3>
                  <p className="text-yellow-100 text-sm">{selectedFormationForCode.title}</p>
                </div>
                <button 
                  onClick={() => setShowCodeModal(false)} 
                  className="text-white hover:text-gray-200 text-xl"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-3">Code pour le formateur :</p>
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <p className="text-4xl font-bold tracking-wider">{generatedCode}</p>
                </div>
                <button 
                  onClick={() => { 
                    navigator.clipboard.writeText(generatedCode); 
                    toast.success("📋 Code copié !"); 
                  }} 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
                >
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