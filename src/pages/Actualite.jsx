import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Actualite() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [actualites, setActualites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 📥 FETCH SAFE
  const fetchActualites = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("actualites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Erreur chargement actualités");
        setActualites([]);
        return;
      }

      setActualites(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur");
      setActualites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  // 🗑 DELETE SAFE
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;

    try {
      const { error } = await supabase
        .from("actualites")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Supprimé !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur suppression");
    }
  };

  // 🖼 IMAGE SAFE
  const getImageUrl = (path) => {
    if (!path) return null;

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(path);

    return data?.publicUrl || null;
  };

  // 🔎 FILTER SAFE
  const filteredActualites = actualites.filter((a) => {
    const text = `${a?.titre || ""} ${a?.contenu || ""}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-20">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-3xl font-bold text-blue-800">
          📰 Actualités
        </h2>

        {isAdmin && (
          <button
            onClick={() => navigate("/ajouter-actualite")}
            className="bg-green-600 text-white px-4 py-2 rounded"
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

      {/* LOADING */}
      {loading ? (
        <p>Chargement...</p>
      ) : actualites.length === 0 ? (
        <p className="text-gray-500">Aucune actualité disponible</p>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full border">

            <thead className="bg-blue-100">
              <tr>
                <th>Image</th>
                <th>Titre</th>
                <th>Contenu</th>
                <th>Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredActualites.map((a) => (
                <tr key={a.id} className="border-t">

                  {/* IMAGE SAFE */}
                  <td>
                    {a.images?.length > 0 && getImageUrl(a.images[0]) ? (
                      <img
                        src={getImageUrl(a.images[0])}
                        className="w-16 h-16 object-cover rounded"
                        alt="actu"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{a.titre || "—"}</td>
                  <td>{a.contenu || "—"}</td>

                  <td>
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString()
                      : "—"}
                  </td>

                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => navigate(`/modifier-actualite/${a.id}`)}
                        className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(a.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Supprimer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  );
}