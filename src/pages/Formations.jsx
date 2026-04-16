import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Formations() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formations, setFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFormations(data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) return;

    try {
      const { error } = await supabase.from("formations").delete().eq("id", id);
      if (error) throw error;

      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  };

  const filteredFormations = formations.filter((f) =>
    `${f.title} ${f.description}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">📚 Nos Formations</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isAdmin && (
          <button
            onClick={() => navigate("/ajouter-formation")}
            className="bg-green-600 text-white px-4 py-2 rounded ml-2"
          >
            ➕ Ajouter
          </button>
        )}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-blue-100">
            <tr>
              <th>Image</th>
              <th>Titre</th>
              <th>Description</th>
              <th>Préinscription</th>
              <th>À la demande</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredFormations.map((f) => (
              <tr key={f.id}>
                <td>
                  {f.imageUrl ? (
                    <img src={getImageUrl(f.imageUrl)} className="w-20 h-16" />
                  ) : (
                    "—"
                  )}
                </td>

                <td>{f.title}</td>
                <td>{f.description}</td>

                <td>
                  {f.preinscriptionLink ? (
                    <a href={f.preinscriptionLink} target="_blank">
                      Lien
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                <td>{f.onDemand ? "✅" : "❌"}</td>

                {isAdmin && (
                  <td>
                    <button
                      onClick={() => navigate(`/modifier-formation/${f.id}`)}
                      className="bg-yellow-500 text-white px-2 py-1 mr-2"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(f.id)}
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