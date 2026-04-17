import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 🔐 SECURITY GUARD
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Accès refusé");
      navigate("/"); // ou "/espace-participant"
    }
  }, [isAdmin, loading, navigate]);

  // 📥 FETCH USERS
  const fetchUsers = async () => {
    setLoadingUsers(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur chargement utilisateurs");
      console.error(error);
    } else {
      setUsers(data || []);
    }

    setLoadingUsers(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // ❌ BLOCK NON ADMIN RENDER
  if (!loading && !isAdmin) return null;

  if (loadingUsers) {
    return <div className="p-6">Chargement utilisateurs...</div>;
  }

  // ✅ ACTIONS
  const toggleApprove = async (user) => {
    const { error } = await supabase
      .from("users")
      .update({ is_approved: !user.is_approved })
      .eq("id", user.id);

    if (error) toast.error("Erreur update approval");
    else {
      toast.success("Statut mis à jour");
      fetchUsers();
    }
  };

  const toggleAdmin = async (user) => {
    const { error } = await supabase
      .from("users")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);

    if (error) toast.error("Erreur update admin");
    else {
      toast.success("Rôle mis à jour");
      fetchUsers();
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) toast.error("Erreur suppression");
    else {
      toast.success("Utilisateur supprimé");
      fetchUsers();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        👥 Gestion des utilisateurs
      </h1>

      <div className="overflow-x-auto bg-white shadow rounded">

        <table className="w-full text-sm text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Approuvé</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">

                <td className="p-3 font-medium">
                  {u.full_name || "—"}
                </td>

                <td className="p-3">{u.email}</td>

                <td className="p-3">
                  {u.is_admin ? "✅" : "❌"}
                </td>

                <td className="p-3">
                  {u.is_approved ? "✅" : "❌"}
                </td>

                <td className="p-3 flex gap-2 flex-wrap">

                  <button
                    onClick={() => toggleApprove(u)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    {u.is_approved ? "Désactiver" : "Approuver"}
                  </button>

                  <button
                    onClick={() => toggleAdmin(u)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Admin
                  </button>

                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Supprimer
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AdminUsers;