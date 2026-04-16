import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormations } from "../context/FormationsContext";
import { useActualites } from "../context/ActualitesContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const { formations, deleteFormation } = useFormations();
  const { actualites, deleteActualite } = useActualites();
  const navigate = useNavigate();

  // 👤 USERS STATE
  const [users, setUsers] = useState([]);

  // 🔐 sécurité admin
  useEffect(() => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/connexion");
      return;
    }

    if (!isAdmin) {
      toast.error("Accès refusé");
      navigate("/espace-participant");
    }
  }, [user, isAdmin, navigate]);

  // 👤 FETCH USERS
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 👤 TOGGLE APPROVE
  const toggleApprove = async (u) => {
    await supabase
      .from("users")
      .update({ is_approved: !u.is_approved })
      .eq("id", u.id);

    fetchUsers();
  };

  // 👤 TOGGLE ADMIN
  const toggleAdmin = async (u) => {
    await supabase
      .from("users")
      .update({ is_admin: !u.is_admin })
      .eq("id", u.id);

    fetchUsers();
  };

  // 👤 DELETE USER
  const deleteUser = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    await supabase.from("users").delete().eq("id", id);
    fetchUsers();
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Tableau de bord Administrateur
      </h1>

      <p className="mb-6 text-gray-600">
        Bienvenue <strong>{user.email}</strong>
      </p>

      <div className="grid md:grid-cols-2 gap-8">

        {/* 📚 FORMATIONS */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">📚 Formations</h2>

          <button
            onClick={() => navigate("/ajouter-formation")}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            ➕ Ajouter une formation
          </button>

          <ul className="space-y-2">
            {formations.map((f) => (
              <li
                key={f.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/modifier-formation/${f.id}`)}
                >
                  {f.title}
                </span>

                <button
                  onClick={async () => {
                    if (window.confirm("Supprimer cette formation ?")) {
                      try {
                        await deleteFormation(f.id);
                        toast.success("Formation supprimée !");
                      } catch {
                        toast.error("Erreur suppression");
                      }
                    }
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 📰 ACTUALITÉS */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">📰 Actualités</h2>

          <button
            onClick={() => navigate("/ajouter-actualite")}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            ➕ Ajouter une actualité
          </button>

          <ul className="space-y-2">
            {actualites.map((a) => (
              <li
                key={a.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/modifier-actualite/${a.id}`)}
                >
                  {a.titre}
                </span>

                <button
                  onClick={async () => {
                    if (window.confirm("Supprimer cette actualité ?")) {
                      try {
                        await deleteActualite(a.id);
                        toast.success("Actualité supprimée !");
                      } catch {
                        toast.error("Erreur suppression");
                      }
                    }
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 👤 USERS MANAGEMENT */}
      <div className="border rounded p-4 shadow-sm mt-8">
        <h2 className="text-2xl font-semibold mb-4">👤 Utilisateurs</h2>

        <ul className="space-y-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-bold">{u.email}</p>
                <p className="text-sm text-gray-500">
                  {u.is_admin ? "Admin" : "User"} |{" "}
                  {u.is_approved ? "Approuvé" : "En attente"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleApprove(u)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  {u.is_approved ? "Désactiver" : "Approuver"}
                </button>

                <button
                  onClick={() => toggleAdmin(u)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Admin
                </button>

                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default TableauDeBordAdmin;