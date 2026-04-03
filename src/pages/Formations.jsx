// frontend/src/pages/Formations.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Formations() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer toutes les formations depuis Supabase
  useEffect(() => {
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

    fetchFormations();
  }, []);

  // 🔹 Supprimer une formation
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) return;

    try {
      const { error } = await supabase.from("formations").delete().eq("id", id);
      if (error) throw error;
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // 🔹 Générer URL publique pour les images
  const getImageUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  };

  // 🔹 Filtrer les formations par recherche
  const filteredFormations = formations.filter((f) =>
    `${f.title} ${f.description}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">📚 Nos Formations</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre ou description..."
          className="border rounded px-3 py-2 w-full md:w-1/3 focus:outline-none focus:ring focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          onClick={() => navigate("/ajouter-formation")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
        >
          ➕ Ajouter Formation
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement des formations...</p>
      ) : filteredFormations.length === 0 ? (
        <p className="text-gray-500">Aucune formation ne correspond à votre recherche.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Titre</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Lien préinscription</th>
                <th className="px-4 py-2 border">À la demande</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormations.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border w-28 h-24">
                    {f.imageUrl ? (
                      <img
                        src={getImageUrl(f.imageUrl)}
                        alt={f.title}
                        className="w-24 h-20 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{f.title}</td>
                  <td className="px-4 py-2 border">{f.description}</td>
                  <td className="px-4 py-2 border">
                    {f.preinscriptionLink ? (
                      <a
                        href={f.preinscriptionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lien
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {f.onDemand ? "✅" : "❌"}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      onClick={() => navigate(`/modifier-formation/${f.id}`)}
                    >
                      Modifier
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(f.id)}
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