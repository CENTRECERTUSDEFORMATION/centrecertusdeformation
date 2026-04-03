// frontend/src/pages/TableauDeBordAdmin.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormations } from "../context/FormationsContext";
import { useActualites } from "../context/ActualitesContext";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user } = useAuth();
  const { formations, deleteFormation } = useFormations();
  const { actualites, deleteActualite } = useActualites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/connexion");
      return;
    }
    if (!user.isAdmin) {
      toast.error("Accès refusé");
      navigate("/espace-participant");
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Tableau de bord Administrateur</h1>
      <p className="mb-6">Bienvenue <strong>{user.fullName}</strong></p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formations */}
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
              <li key={f._id} className="flex justify-between items-center border p-2 rounded">
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/modifier-formation/${f._id}`)}
                >
                  {f.title}
                </span>
                <button
                  onClick={async () => {
                    if (window.confirm("Supprimer cette formation ?")) {
                      try {
                        await deleteFormation(f._id);
                        toast.success("Formation supprimée !");
                      } catch (err) {
                        toast.error("Erreur lors de la suppression");
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

        {/* Actualités */}
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
              <li key={a._id} className="flex justify-between items-center border p-2 rounded">
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/modifier-actualite/${a._id}`)}
                >
                  {a.titre}
                </span>
                <button
                  onClick={async () => {
                    if (window.confirm("Supprimer cette actualité ?")) {
                      try {
                        await deleteActualite(a._id);
                        toast.success("Actualité supprimée !");
                      } catch (err) {
                        toast.error("Erreur lors de la suppression");
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
    </div>
  );
};

export default TableauDeBordAdmin;
