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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [onDemand, setOnDemand] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !fullDescription) {
      toast.error("Champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      let imagePath = null;

      if (image) {
        const fileName = `formations/${Date.now()}-${image.name}`;
        const { error } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);

        if (error) throw error;
        imagePath = fileName;
      }

      const { error } = await supabase.from("formations").insert([
        {
          title,
          description,
          fullDescription,
          preinscriptionLink,
          imageUrl: imagePath,
          onDemand,
        },
      ]);

      if (error) throw error;

      toast.success("Formation ajoutée !");
      navigate("/formations");
    } catch (err) {
      console.error(err);
      toast.error("Erreur ajout formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Ajouter formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          placeholder="Titre"
          className="w-full border p-2"
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2"
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          placeholder="Description complète"
          className="w-full border p-2"
          onChange={(e) => setFullDescription(e.target.value)}
        />

        <input
          placeholder="Lien"
          className="w-full border p-2"
          onChange={(e) => setPreinscriptionLink(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label>
          <input
            type="checkbox"
            onChange={(e) => setOnDemand(e.target.checked)}
          />
          Formation à la demande
        </label>

        <button className="bg-blue-800 text-white px-4 py-2 w-full">
          {loading ? "..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
}