// frontend/src/pages/ModifierFormation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const ModifierFormation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  // 🔹 Récupérer la formation depuis Supabase
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

        // Prévisualisation image existante
        if (data.imageUrl) {
          const { data: publicData } = supabase.storage
            .from("uploads")
            .getPublicUrl(data.imageUrl);
          setPreview(publicData.publicUrl);
        }

      } catch (err) {
        console.error(err);
        toast.error("Impossible de récupérer la formation");
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  // 🔹 Gestion upload nouvelle image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormation({ ...formation, imageFile: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = formation.imageUrl;

      // 🔹 Si une nouvelle image est uploadée, stocker sur Supabase
      if (formation.imageFile) {
        const fileName = `${Date.now()}-${formation.imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`formations/${fileName}`, formation.imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        imageUrl = `formations/${fileName}`;
      }

      // 🔹 Mettre à jour la formation
      const { error } = await supabase
        .from("formations")
        .update({
          title: formation.title,
          description: formation.description,
          fullDescription: formation.fullDescription,
          preinscriptionLink: formation.preinscriptionLink,
          imageUrl,
          onDemand: formation.onDemand,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Formation mise à jour avec succès !");
      navigate("/formations");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement de la formation...</p>;
  if (!formation) return <p className="text-center mt-10 text-red-600">Formation introuvable</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center">Modifier la formation</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block font-medium mb-1">Titre</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={formation.title}
            onChange={(e) => setFormation({ ...formation, title: e.target.value })}
          />
        </div>

        {/* Description courte */}
        <div>
          <label className="block font-medium mb-1">Description courte</label>
          <textarea
            rows={4}
            className="w-full border px-3 py-2 rounded-md resize-none"
            value={formation.description}
            onChange={(e) => setFormation({ ...formation, description: e.target.value })}
          />
        </div>

        {/* Description complète */}
        <div>
          <label className="block font-medium mb-1">Description complète</label>
          <textarea
            rows={6}
            className="w-full border px-3 py-2 rounded-md resize-none"
            value={formation.fullDescription}
            onChange={(e) => setFormation({ ...formation, fullDescription: e.target.value })}
          />
        </div>

        {/* Lien préinscription */}
        <div>
          <label className="block font-medium mb-1">Lien préinscription</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={formation.preinscriptionLink || ""}
            onChange={(e) => setFormation({ ...formation, preinscriptionLink: e.target.value })}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" className="w-full" onChange={handleImageChange} />
          {preview && (
            <img src={preview} alt="Prévisualisation" className="mt-2 w-48 h-32 object-cover rounded-md" />
          )}
        </div>

        {/* Formation à la demande */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="onDemand"
            className="mr-2"
            checked={formation.onDemand || false}
            onChange={(e) => setFormation({ ...formation, onDemand: e.target.checked })}
          />
          <label htmlFor="onDemand">Formation à la demande</label>
        </div>

        {/* Bouton enregistrer */}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition w-full"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
};

export default ModifierFormation;