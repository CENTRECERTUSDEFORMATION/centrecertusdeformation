import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger users
  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur chargement utilisateurs");
      console.error(error);
    } else {
      setUsers(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔁 Toggle admin
  const toggleAdmin = async (user) => {
    const { error } = await supabase
      .from("users")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur mise à jour admin");
    } else {
      toast.success("Rôle admin mis à jour");
      fetchUsers();
    }
  };

  // 🔁 Toggle approval
  const toggleApproval = async (user) => {
    const { error } = await supabase
      .from("users")
      .update({ is_approved: !user.is_approved })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur approbation");
    } else {
      toast.success("Statut utilisateur mis à jour");
      fetchUsers();
    }
  };

  // ❌ Delete user
  const deleteUser = async (user) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur suppression");
    } else {
      toast.success("Utilisateur supprimé");
      fetchUsers();
    }
  };

  // 🔐 sécurité front
  if (authLoading) return <div className="p-4">Chargement...</div>;

  if (!isAdmin) {
    return (
      <div className="p-6 text-red-600 font-bold">
        Accès refusé (Admin uniquement)
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Gestion des utilisateurs
      </h1>

      {loading ? (
        <div>Chargement utilisateurs...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Admin</th>
                <th className="p-3">Approuvé</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">

                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3">{u.email}</td>

                  {/* ADMIN */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleAdmin(u)}
                      className={`px-3 py-1 rounded text-white ${
                        u.is_admin ? "bg-green-600" : "bg-gray-400"
                      }`}
                    >
                      {u.is_admin ? "Admin" : "User"}
                    </button>
                  </td>

                  {/* APPROVAL */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleApproval(u)}
                      className={`px-3 py-1 rounded text-white ${
                        u.is_approved ? "bg-blue-600" : "bg-red-500"
                      }`}
                    >
                      {u.is_approved ? "Actif" : "Bloqué"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteUser(u)}
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
      )}
    </div>
  );
}