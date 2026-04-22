import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AjouterFormation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <p className="text-center mt-10">Accès refusé</p>;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [preinscriptionLink, setPreinscriptionLink] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onDemand, setOnDemand] = useState(false);

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !fullDescription) {
      toast.error("Titre, description courte et description complète sont obligatoires");
      return;
    }

    setLoading(true);

    try {
      const uploadedPaths = [];

      for (const image of images) {
        const cleanName = cleanFileName(image.name);
        const fileName = `formations/${Date.now()}-${cleanName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        uploadedPaths.push(fileName);
      }

      const { error: insertError } = await supabase.from("formations").insert([
        {
          title: title,
          description,
          fullDescription,
          preinscriptionLink,
          images: uploadedPaths,
          onDemand,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success(`Formation ajoutée avec ${uploadedPaths.length} image(s) !`);
      navigate("/formations");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de la formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6">Ajouter une formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            placeholder="Titre de la formation"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description courte *</label>
          <textarea
            placeholder="Brève description (apparaît dans la liste)"
            className="w-full border p-2 rounded"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description complète *</label>
          <textarea
            placeholder="Description détaillée de la formation"
            className="w-full border p-2 rounded"
            rows="6"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lien de préinscription</label>
          <input
            placeholder="https://..."
            className="w-full border p-2 rounded"
            value={preinscriptionLink}
            onChange={(e) => setPreinscriptionLink(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Images (plusieurs possibles)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images
          </p>
        </div>

        {previews.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Aperçus :</p>
            <div className="flex flex-wrap gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e) => setOnDemand(e.target.checked)}
          />
          Formation à la demande
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white px-4 py-2 w-full rounded hover:bg-blue-900 transition disabled:opacity-50"
        >
          {loading ? "Ajout en cours..." : "➕ Ajouter la formation"}
        </button>
      </form>
    </div>
  );
}