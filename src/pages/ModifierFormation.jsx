import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const ModifierFormation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔐 SECURITY FIX
  const { isAdmin, loading: authLoading } = useAuth();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  // ⛔ BLOCK NON ADMIN
  if (!authLoading && !isAdmin) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Accès refusé (Admin uniquement)
      </div>
    );
  }

  // 📥 FETCH
  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setFormation(data || null);

        // image preview
        if (data?.imageUrl) {
          const { data: publicData } = supabase.storage
            .from("uploads")
            .getPublicUrl(data.imageUrl);

          setPreview(publicData?.publicUrl || "");
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

  // 🖼️ IMAGE CHANGE
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !formation) return;

    setFormation({ ...formation, imageFile: file });
    setPreview(URL.createObjectURL(file));
  };

  // 💾 UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error("Accès refusé");
      return;
    }

    if (!formation) return;

    setSaving(true);

    try {
      let imageUrl = formation.imageUrl;

      // 📤 upload new image
      if (formation.imageFile) {
        const fileName = `formations/${Date.now()}-${formation.imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, formation.imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        imageUrl = fileName;
      }

      // 💾 UPDATE DB
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

      toast.success("Formation mise à jour !");
      navigate("/formations");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Chargement...
      </p>
    );
  }

  // ❌ NOT FOUND
  if (!formation) {
    return (
      <p className="text-center mt-10 text-red-600">
        Formation introuvable
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">

      <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center">
        Modifier la formation
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* TITRE */}
        <div>
          <label className="block font-medium mb-1">Titre</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={formation.title || ""}
            onChange={(e) =>
              setFormation({ ...formation, title: e.target.value })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block font-medium mb-1">
            Description courte
          </label>
          <textarea
            rows={4}
            className="w-full border px-3 py-2 rounded-md"
            value={formation.description || ""}
            onChange={(e) =>
              setFormation({ ...formation, description: e.target.value })
            }
          />
        </div>

        {/* FULL DESC */}
        <div>
          <label className="block font-medium mb-1">
            Description complète
          </label>
          <textarea
            rows={6}
            className="w-full border px-3 py-2 rounded-md"
            value={formation.fullDescription || ""}
            onChange={(e) =>
              setFormation({
                ...formation,
                fullDescription: e.target.value,
              })
            }
          />
        </div>

        {/* LINK */}
        <div>
          <label className="block font-medium mb-1">
            Lien préinscription
          </label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={formation.preinscriptionLink || ""}
            onChange={(e) =>
              setFormation({
                ...formation,
                preinscriptionLink: e.target.value,
              })
            }
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" className="w-full" onChange={handleImageChange} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 w-48 h-32 object-cover rounded-md"
            />
          )}
        </div>

        {/* ON DEMAND */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="onDemand"
            className="mr-2"
            checked={formation.onDemand || false}
            onChange={(e) =>
              setFormation({
                ...formation,
                onDemand: e.target.checked,
              })
            }
          />
          <label htmlFor="onDemand">
            Formation à la demande
          </label>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-800 text-white px-6 py-2 rounded-md w-full"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>

      </form>
    </div>
  );
};

export default ModifierFormation;