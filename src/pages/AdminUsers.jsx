import React, { useEffect, useState } from "react";
import { supabase, supabaseAdmin } from "../supabaseClient";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminUsers = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const fetchUsers = async () => {
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
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Exception:", err);
      toast.error("Erreur de connexion");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

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

      console.log("Création de:", newUser.email);

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

  const toggleApprove = async (user) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          is_approved: !user.is_approved,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast.success(`Utilisateur ${user.is_approved ? "désapprouvé" : "approuvé"}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erreur mise à jour");
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          is_admin: !user.is_admin,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast.success(`Rôle admin ${user.is_admin ? "retiré" : "attribué"}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erreur mise à jour");
    }
  };

  const deleteUser = async (id, email) => {
    if (!window.confirm(`Supprimer définitivement ${email} ?`)) return;

    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) {
        console.error("Auth delete error:", authError);
      }

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

  if (loading || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1a56db" }}>
            👥 Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Total : {users.length} utilisateur(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#76c21f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md"
        >
          + Ajouter un utilisateur
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
          <button
            onClick={fetchUsers}
            className="mt-3 text-[#1a56db] hover:underline"
          >
            Rafraîchir
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.full_name || "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    {u.is_admin ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">👑 Admin</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">👤 Utilisateur</span>
                    )}
                  </td>
                  <td className="p-3">
                    {u.is_approved ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">✅ Approuvé</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">⏳ En attente</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => resetPassword(u.email)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                    >
                      🔑 Reset MDP
                    </button>
                    <button
                      onClick={() => toggleApprove(u)}
                      className={`px-2 py-1 rounded text-xs text-white ${
                        u.is_approved ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {u.is_approved ? "⛔ Désapprouver" : "✅ Approuver"}
                    </button>
                    <button
                      onClick={() => toggleAdmin(u)}
                      className={`px-2 py-1 rounded text-xs text-white ${
                        u.is_admin ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {u.is_admin ? "👤 Retirer Admin" : "⭐ Nommer Admin"}
                    </button>
                    {u.email !== "admin@certus.tn" && (
                      <button
                        onClick={() => deleteUser(u.id, u.email)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL AJOUT UTILISATEUR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#1a56db" }}>
                Ajouter un utilisateur
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.is_admin}
                    onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  />
                  <span className="text-sm">👑 Administrateur</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.is_approved}
                    onChange={(e) => setNewUser({ ...newUser, is_approved: e.target.checked })}
                  />
                  <span className="text-sm">✅ Approuvé immédiatement</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#1a56db] text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creating ? "Création..." : "➕ Créer l'utilisateur"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;