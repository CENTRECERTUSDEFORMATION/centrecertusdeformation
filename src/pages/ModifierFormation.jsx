import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ModifierFormation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formation, setFormation] = useState(null);
  
  // Formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [preinscriptionLink, setPreinscriptionLink] = useState("");
  const [onDemand, setOnDemand] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Vérification admin
  if (!user?.isAdmin) {
    return <p className="text-center mt-20">Accès refusé</p>;
  }

  // Nettoyer le nom du fichier
  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  // Charger la formation existante
  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setFormation(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setFullDescription(data.fullDescription || "");
        setPreinscriptionLink(data.preinscriptionLink || "");
        setOnDemand(data.onDemand || false);
        setExistingImages(data.images || []);
      } catch (error) {
        console.error(error);
        toast.error("Erreur chargement formation");
        navigate("/formations");
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id, navigate]);

  const getImageUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(previews);
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Supprimer les images retirées du storage
      for (const imagePath of imagesToDelete) {
        await supabase.storage.from("uploads").remove([imagePath]);
      }

      // 2. Uploader les nouvelles images
      const uploadedPaths = [...existingImages];
      for (const image of newImages) {
        const cleanName = cleanFileName(image.name);
        const fileName = `formations/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);
        
        if (uploadError) throw uploadError;
        uploadedPaths.push(fileName);
      }

      // 3. Mettre à jour la formation
      const { error: updateError } = await supabase
        .from("formations")
        .update({
          title,
          description,
          fullDescription,
          preinscriptionLink,
          images: uploadedPaths,
          onDemand,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      toast.success("Formation modifiée avec succès !");
      navigate("/formations");

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6 mt-20"
    >
      <h2 className="text-2xl font-bold mb-6">Modifier la formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description courte */}
        <div>
          <label className="block text-sm font-medium mb-1">Description courte *</label>
          <textarea
            className="w-full border p-2 rounded"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Description complète */}
        <div>
          <label className="block text-sm font-medium mb-1">Description complète *</label>
          <textarea
            className="w-full border p-2 rounded"
            rows="6"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            required
          />
        </div>

        {/* Lien préinscription */}
        <div>
          <label className="block text-sm font-medium mb-1">Lien de préinscription</label>
          <input
            type="url"
            className="w-full border p-2 rounded"
            value={preinscriptionLink}
            onChange={(e) => setPreinscriptionLink(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Images existantes */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Images actuelles</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={getImageUrl(img)}
                    alt={`Image ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajouter nouvelles images */}
        <div>
          <label className="block text-sm font-medium mb-1">Ajouter des images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImages}
            className="w-full"
          />
        </div>

        {/* Aperçu nouvelles images */}
        {newPreviews.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Nouvelles images</label>
            <div className="flex flex-wrap gap-3">
              {newPreviews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={preview}
                    alt={`Nouvelle ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Option à la demande */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onDemand}
            onChange={(e) => setOnDemand(e.target.checked)}
          />
          Formation à la demande
        </label>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900 transition disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "💾 Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/formations")}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
}