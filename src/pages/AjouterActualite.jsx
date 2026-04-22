import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AjouterActualite() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

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

    if (!titre) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setLoading(true);

    try {
      const uploadedPaths = [];

      for (const image of images) {
        const cleanName = cleanFileName(image.name);
        const fileName = `actualites/${Date.now()}-${cleanName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        uploadedPaths.push(fileName);
      }

      const { error: insertError } = await supabase.from("actualites").insert([
        {
          titre,
          contenu: contenu || null,
          images: uploadedPaths,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success(`Actualité ajoutée avec ${uploadedPaths.length} image(s) !`);
      navigate("/actualite");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de l'actualité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mt-20 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajouter une actualité</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            type="text"
            placeholder="Titre de l'actualité"
            className="w-full border p-2 rounded"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contenu</label>
          <textarea
            placeholder="Description de l'actualité"
            className="w-full border p-2 rounded"
            rows="4"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white px-4 py-2 w-full rounded hover:bg-blue-900 transition disabled:opacity-50"
        >
          {loading ? "Ajout en cours..." : "➕ Ajouter l'actualité"}
        </button>
      </form>
    </div>
  );
}