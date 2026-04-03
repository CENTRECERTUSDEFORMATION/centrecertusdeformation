// frontend/src/pages/AjouterActualite.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AjouterActualite() {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Sélection multiple et preview
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre || !contenu) {
      setMessage("❌ Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 🔹 Upload images dans Supabase Storage
      const uploadedPaths = [];
      for (const img of images) {
        const fileName = `actualites/${Date.now()}-${img.name}`;
        const { error } = await supabase.storage
          .from("uploads")
          .upload(fileName, img);
        if (error) throw error;
        uploadedPaths.push(fileName);
      }

      // 🔹 Créer l'actualité dans Supabase
      const { data, error } = await supabase
        .from("actualites")
        .insert([
          {
            titre,
            contenu,
            images: uploadedPaths,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage("✅ Actualité ajoutée avec succès !");
      setTitre("");
      setContenu("");
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'ajout de l'actualité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-32 pb-20">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-10">
        ➕ Ajouter une Actualité
      </h1>

      <div className="w-full max-w-3xl p-10 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-y-auto">
        {message && (
          <p className={`mb-6 text-base ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            placeholder="Contenu"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div>
            <label className="block mb-2 font-medium">Images :</label>
            <input type="file" multiple onChange={handleImagesChange} className="w-full" />
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`preview-${i}`} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
          >
            {loading ? "Ajout en cours..." : "Ajouter l'actualité"}
          </button>
        </form>
      </div>
    </div>
  );
}