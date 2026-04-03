// frontend/src/pages/Actualite.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Actualite() {
  const navigate = useNavigate();
  const [actualites, setActualites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer les actualités
  useEffect(() => {
    const fetchActualites = async () => {
      try {
        const { data, error } = await supabase
          .from("actualites")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setActualites(data);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des actualités");
      } finally {
        setLoading(false);
      }
    };

    fetchActualites();
  }, []);

  // 🔹 Supprimer une actualité
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette actualité ?")) return;
    try {
      const { error } = await supabase.from("actualites").delete().eq("id", id);
      if (error) throw error;
      setActualites((prev) => prev.filter((a) => a.id !== id));
      toast.success("Actualité supprimée !");
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

  // 🔹 Filtrage par titre/contenu
  const filteredActualites = actualites.filter((a) =>
    `${a.titre} ${a.contenu}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-blue-800">📰 Actualités</h2>
        <button
          onClick={() => navigate("/ajouter-actualite")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Ajouter Actualité
        </button>
      </div>

      <input
        type="text"
        placeholder="Rechercher par titre ou contenu..."
        className="border rounded px-3 py-2 w-full md:w-1/3 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p className="text-gray-500">Chargement des actualités...</p>
      ) : filteredActualites.length === 0 ? (
        <p className="text-gray-500">Aucune actualité ne correspond à votre recherche.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border">Images</th>
                <th className="px-4 py-2 border">Titre</th>
                <th className="px-4 py-2 border">Contenu</th>
                <th className="px-4 py-2 border">Publié le</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActualites.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border w-36">
                    {a.images && a.images.length > 0 ? (
                      <div className="flex gap-1">
                        <img
                          src={getImageUrl(a.images[0])}
                          alt={a.titre}
                          className="w-16 h-16 object-cover rounded"
                        />
                        {a.images.length > 1 &&
                          a.images.slice(1, 3).map((img, i) => (
                            <img
                              key={i}
                              src={getImageUrl(img)}
                              alt={`mini-${i}`}
                              className="w-8 h-8 object-cover rounded border border-white"
                            />
                          ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{a.titre}</td>
                  <td className="px-4 py-2 border line-clamp-3">{a.contenu}</td>
                  <td className="px-4 py-2 border">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      onClick={() => navigate(`/modifier-actualite/${a.id}`)}
                    >
                      Modifier
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(a.id)}
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