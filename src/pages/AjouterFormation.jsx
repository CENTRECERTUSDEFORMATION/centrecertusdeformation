// frontend/src/pages/AjouterFormation.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AjouterFormation() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [preinscriptionLink, setPreinscriptionLink] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [onDemand, setOnDemand] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !fullDescription) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      let imagePath = null;

      // 🔹 Upload image sur Supabase Storage
      if (image) {
        const fileName = `formations/${Date.now()}-${image.name}`;
        const { error } = await supabase.storage
          .from("uploads")
          .upload(fileName, image, { upsert: true });
        if (error) throw error;
        imagePath = fileName;
      }

      // 🔹 Insertion dans Supabase
      const { data, error } = await supabase
        .from("formations")
        .insert([
          {
            title,
            description,
            fullDescription,
            preinscriptionLink,
            imageUrl: imagePath,
            onDemand,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Formation ajoutée avec succès !");
      navigate("/formations"); // retour liste formations

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de la formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-12 md:mt-16 lg:mt-24">
      <h2 className="text-2xl font-bold mb-6">Ajouter une formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block font-medium mb-1">Titre *</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description courte */}
        <div>
          <label className="block font-medium mb-1">
            Description courte * (aperçu)
          </label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Texte multi-lignes pour aperçu rapide"
          />
        </div>

        {/* Description complète */}
        <div>
          <label className="block font-medium mb-1">
            Description complète * (détails)
          </label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            rows={6}
            placeholder="Texte multi-lignes détaillé pour la formation"
          />
        </div>

        {/* Lien préinscription */}
        <div>
          <label className="block font-medium mb-1">Lien préinscription</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={preinscriptionLink}
            onChange={(e) => setPreinscriptionLink(e.target.value)}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" className="w-full" onChange={handleImageChange} />
          {preview && (
            <img
              src={preview}
              alt="Prévisualisation"
              className="mt-2 w-48 h-32 object-cover rounded-md"
            />
          )}
        </div>

        {/* Formation à la demande */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="onDemand"
            className="mr-2"
            checked={onDemand}
            onChange={(e) => setOnDemand(e.target.checked)}
          />
          <label htmlFor="onDemand">Formation à la demande</label>
        </div>

        {/* Bouton ajouter */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full"
        >
          {loading ? "Ajout en cours..." : "Ajouter la formation"}
        </button>
      </form>
    </div>
  );
}