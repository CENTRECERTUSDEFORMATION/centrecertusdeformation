import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formations, setFormations] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données
  const fetchData = async () => {
    setLoading(true);

    // Charger formations
    const { data: formationsData, error: formationsError } = await supabase
      .from("formations")
      .select("*")
      .order("id", { ascending: false });

    if (formationsError) {
      console.error(formationsError);
      toast.error("Erreur chargement formations");
    } else {
      setFormations(formationsData || []);
    }

    // Charger actualites
    const { data: actualitesData, error: actualitesError } = await supabase
      .from("actualites")
      .select("*")
      .order("id", { ascending: false });

    if (actualitesError) {
      console.error(actualitesError);
      toast.error("Erreur chargement actualités");
    } else {
      setActualites(actualitesData || []);
    }

    setLoading(false);
  };

  // Supprimer une formation
  const deleteFormation = async (id) => {
    if (!window.confirm("Supprimer cette formation ?")) return;

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    }
  };

  // Supprimer une actualité
  const deleteActualite = async (id) => {
    if (!window.confirm("Supprimer cette actualité ?")) return;

    const { error } = await supabase
      .from("actualites")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Actualité supprimée");
    }
  };

  // Vérification admin
  useEffect(() => {
    if (!user) {
      navigate("/connexion");
      return;
    }

    if (!isAdmin) {
      navigate("/espace-participant");
      return;
    }

    fetchData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;
  if (loading) return <p className="text-center mt-20">Chargement...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORMATIONS */}
        <div>
          <h2 className="text-xl mb-2 font-semibold">Formations</h2>

          <button
            onClick={() => navigate("/ajouter-formation")}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter
          </button>

          {formations.length === 0 ? (
            <p className="text-gray-500">Aucune formation</p>
          ) : (
            formations.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center border p-2 mb-2 rounded"
              >
                <span
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/modifier-formation/${f.id}`)}
                >
                  {f.title || f.titre}
                </span>

                <button
                  onClick={() => deleteFormation(f.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>

        {/* ACTUALITES */}
        <div>
          <h2 className="text-xl mb-2 font-semibold">Actualités</h2>

          <button
            onClick={() => navigate("/ajouter-actualite")}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter
          </button>

          {actualites.length === 0 ? (
            <p className="text-gray-500">Aucune actualité</p>
          ) : (
            actualites.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center border p-2 mb-2 rounded"
              >
                <span>{a.titre}</span>

                <button
                  onClick={() => deleteActualite(a.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TableauDeBordAdmin;