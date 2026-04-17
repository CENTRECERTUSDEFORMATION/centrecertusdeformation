import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📥 FETCH SUPABASE
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
      } catch (err) {
        console.error(err);
        setFormation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

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

  // 📄 DESCRIPTION LIGNES
  const lignesDescription = formation.fullDescription
    ? formation.fullDescription
        .split("\n")
        .filter((l) => l.trim() !== "")
    : [];

  // 🖼️ IMAGE SUPABASE
  const getImageUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("uploads").getPublicUrl(path)
      .data.publicUrl;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* IMAGE */}
      {formation.imageUrl && (
        <div className="w-full max-w-3xl mx-auto mb-6 overflow-hidden rounded-md shadow">
          <img
            src={getImageUrl(formation.imageUrl)}
            alt={formation.title}
            className="w-full aspect-square max-h-60 md:max-h-64 lg:max-h-72 object-cover object-top rounded-md"
          />
        </div>
      )}

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-4 text-blue-800">
        {formation.title}
      </h1>

      {/* DESCRIPTION */}
      <div className="text-gray-700 mb-6 leading-relaxed">
        {lignesDescription.map((ligne, index) => (
          <p key={index} className="mb-2">
            {ligne}
          </p>
        ))}
      </div>

      {/* INSCRIPTION */}
      {formation.preinscriptionLink && (
        <a
          href={formation.preinscriptionLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium mb-4"
        >
          S’inscrire
        </a>
      )}

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
      >
        ← Retour
      </button>

    </div>
  );
}