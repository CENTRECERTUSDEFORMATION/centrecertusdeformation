import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Actualite() {
  const navigate = useNavigate();

  const { user, isAdmin, loading: authLoading } = useAuth();

  const [actualites, setActualites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const canManage = user?.isAdmin === true;

  const fetchActualites = async () => {
    try {
      const { data, error } = await supabase
        .from("actualites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setActualites(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement actualités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  const handleDelete = async (id) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }

    if (!window.confirm("Supprimer cette actualité ?")) return;

    try {
      const { error } = await supabase
        .from("actualites")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Actualité supprimée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur suppression");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  };

  const filtered = actualites.filter((a) =>
    `${a.titre || ""} ${a.contenu || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <p className="text-center mt-10">Chargement utilisateur...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-3xl font-bold text-blue-800">
          📰 Actualités
        </h2>

        {canManage && (
          <button
            onClick={() => navigate("/ajouter-actualite")}
            className="bg-green-600 text-white px-4 py-2"
          >
            ➕ Ajouter
          </button>
        )}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Rechercher..."
        className="border px-3 py-2 mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* LOADING DATA */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border">

          <thead className="bg-blue-100">
            <tr>
              <th>Image</th>
              <th>Titre</th>
              <th>Contenu</th>
              <th>Date</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>

                {/* IMAGE SAFE */}
                <td>
                  {Array.isArray(a.images) && a.images.length > 0 ? (
                    <img
                      src={getImageUrl(a.images[0])}
                      className="w-16 h-16 object-cover"
                      alt="actualité"
                    />
                  ) : (
                    "—"
                  )}
                </td>

                <td>{a.titre}</td>
                <td>{a.contenu}</td>

                <td>
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString()
                    : "—"}
                </td>

                {canManage && (
                  <td>
                    <button
                      onClick={() =>
                        navigate(`/modifier-actualite/${a.id}`)
                      }
                      className="bg-yellow-500 text-white px-2 py-1 mr-2"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-600 text-white px-2 py-1"
                    >
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}