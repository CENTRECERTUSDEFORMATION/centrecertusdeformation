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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    is_admin: false,
    is_approved: true
  });
  const [creating, setCreating] = useState(false);

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

      if (error) {
        console.error("Erreur fetch users:", error);
        toast.error("Erreur chargement utilisateurs: " + error.message);
        setUsers([]);
      } else {
        console.log("Utilisateurs chargés:", data?.length);
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Exception:", err);
      toast.error("Erreur de connexion");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  // Filtrer les utilisateurs par recherche
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (!supabaseAdmin) {
        throw new Error("supabaseAdmin non configuré");
      }

      if (!newUser.email || !newUser.password || !newUser.full_name) {
        toast.error("Tous les champs sont obligatoires");
        setCreating(false);
        return;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.full_name
        }
      });

      if (authError) {
        if (authError.message.includes("already been registered")) {
          toast.error(`L'email ${newUser.email} existe déjà dans le système`);
        } else {
          toast.error("Erreur Auth: " + authError.message);
        }
        console.error("Auth error:", authError);
        setCreating(false);
        return;
      }

      if (!authData?.user?.id) {
        throw new Error("ID utilisateur non reçu");
      }

      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          is_admin: newUser.is_admin || false,
          is_approved: newUser.is_approved || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error("DB error:", dbError);
        toast.error("Erreur DB: " + dbError.message);
        setCreating(false);
        return;
      }

      toast.success(`✅ Utilisateur ${newUser.email} créé avec succès !`);
      setShowAddModal(false);
      setNewUser({ email: "", password: "", full_name: "", is_admin: false, is_approved: true });
      fetchUsers();

    } catch (error) {
      console.error("Erreur complète:", error);
      toast.error(error.message || "❌ Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  // ✅ TOGGLE APPROUVE - Change le badge ET le texte du bouton
  const toggleApprove = async (user) => {
    const previousStatus = user.is_approved;
    const newStatus = !previousStatus;
    
    console.log("=== toggleApprove ===");
    console.log("ID:", user.id);
    console.log("Statut actuel:", previousStatus);
    console.log("Nouveau statut:", newStatus);
    
    try {
      // MISE À JOUR UI IMMÉDIATE
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, is_approved: newStatus, updated_at: new Date().toISOString() } 
            : u
        )
      );
      
      // Mise à jour dans la base de données
      const { error } = await supabase
        .from("users")
        .update({ 
          is_approved: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      const message = newStatus ? "approuvé" : "désapprouvé";
      toast.success(`✅ Utilisateur ${message} avec succès !`);
      
    } catch (error) {
      console.error("Erreur toggleApprove:", error);
      toast.error("❌ Erreur lors de la mise à jour");
      
      // Rollback en cas d'erreur
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, is_approved: previousStatus } 
            : u
        )
      );
    }
  };

  // ✅ TOGGLE ADMIN
  const toggleAdmin = async (user) => {
    const previousStatus = user.is_admin;
    const newStatus = !previousStatus;
    
    try {
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, is_admin: newStatus } : u
        )
      );
      
      const { error } = await supabase
        .from("users")
        .update({ 
          is_admin: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast.success(`👑 Admin ${newStatus ? "nommé" : "retiré"}`);
      
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la mise à jour");
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, is_admin: previousStatus } : u
        )
      );
    }
  };

  const deleteUser = async (id, email) => {
    if (!window.confirm(`Supprimer définitivement ${email} ?`)) return;

    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) console.error("Auth delete error:", authError);

      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetPassword = async (email) => {
    if (!email) {
      toast.error("Email invalide");
      return;
    }
    
    const lastResetTime = localStorage.getItem(`resetMdp_${email}`);
    if (lastResetTime && Date.now() - parseInt(lastResetTime) < 60000) {
      toast.error("Veuillez attendre 1 minute avant de réessayer");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Trop de tentatives. Veuillez réessayer dans quelques minutes.");
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      } else {
        localStorage.setItem(`resetMdp_${email}`, Date.now().toString());
        toast.success(`Email de réinitialisation envoyé à ${email}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de l'envoi");
    }
  };

  // Statistiques
  const stats = [
    { label: "Total utilisateurs", value: users.length, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "Administrateurs", value: users.filter(u => u.is_admin).length, icon: "👑", color: "from-purple-500 to-purple-600" },
    { label: "Approuvés", value: users.filter(u => u.is_approved).length, icon: "✅", color: "from-green-500 to-green-600" },
    { label: "En attente", value: users.filter(u => !u.is_approved).length, icon: "⏳", color: "from-orange-500 to-orange-600" },
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
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white rounded-2xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 p-8">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <span>👥</span> Gestion des utilisateurs
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Gérez les comptes, les rôles et les autorisations
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-[#1a56db] px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>➕</span> Ajouter un utilisateur
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Barre de recherche */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
              <button
                onClick={fetchUsers}
                className="mt-3 text-[#1a56db] hover:underline"
              >
                Rafraîchir
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-600">Utilisateur</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Email</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Rôle</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Statut</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#1a56db] to-[#76c21f] rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {user.full_name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-gray-800">{user.full_name || "—"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">
                          {user.is_admin ? (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              <span>👑</span> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              <span>👤</span> Utilisateur
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {user.is_approved ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              <span>✅</span> Approuvé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                              <span>⏳</span> En attente
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => resetPassword(user.email)}
                              className="px-2 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition flex items-center gap-1"
                              title="Réinitialiser le mot de passe"
                            >
                              🔑 MDP
                            </button>
                            <button
                              onClick={() => toggleApprove(user)}
                              className={`px-2 py-1 rounded-lg text-xs text-white transition flex items-center gap-1 ${
                                user.is_approved ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
                              }`}
                              title={user.is_approved ? "Désapprouver" : "Approuver"}
                            >
                              {user.is_approved ? "⛔ Désapprouver" : "✅ Approuver"}
                            </button>
                            <button
                              onClick={() => toggleAdmin(user)}
                              className={`px-2 py-1 rounded-lg text-xs text-white transition flex items-center gap-1 ${
                                user.is_admin ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              title={user.is_admin ? "Retirer admin" : "Nommer admin"}
                            >
                              {user.is_admin ? "👤 Retirer admin" : "⭐ Nommer admin"}
                            </button>
                            {user.email !== "admin@certus.tn" && (
                              <button
                                onClick={() => deleteUser(user.id, user.email)}
                                className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition flex items-center gap-1"
                                title="Supprimer"
                              >
                                🗑️ Supprimer
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL AJOUT UTILISATEUR */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Ajouter un utilisateur</h2>
                      <p className="text-blue-100 text-sm">Créez un nouveau compte</p>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition text-2xl">
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={createUser} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUser.is_admin}
                        onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                        className="w-4 h-4 text-[#1a56db]"
                      />
                      <span className="text-sm">👑 Administrateur</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUser.is_approved}
                        onChange={(e) => setNewUser({ ...newUser, is_approved: e.target.checked })}
                        className="w-4 h-4 text-[#1a56db]"
                      />
                      <span className="text-sm">✅ Approuvé immédiatement</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {creating ? "Création en cours..." : "➕ Créer l'utilisateur"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminUsers;