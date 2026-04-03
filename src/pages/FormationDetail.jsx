import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/formations/${id}`)
      .then((res) => setFormation(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Chargement...</p>;
  }

  if (!formation) {
    return (
      <p className="text-center mt-10 text-red-600">Formation introuvable</p>
    );
  }

  // Transformation du texte en tableau de lignes
  const lignesDescription = formation.fullDescription
    ? formation.fullDescription.split("\n").filter((l) => l.trim() !== "")
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image responsive */}
      {formation.imageUrl && (
        <div className="w-full max-w-3xl mx-auto mb-6 overflow-hidden rounded-md shadow">
          <img
            src={`${import.meta.env.VITE_API_URL}${formation.imageUrl}`}
            alt={formation.title}
            className="w-full aspect-square max-h-60 md:max-h-64 lg:max-h-72 object-cover object-top rounded-md"
          />
        </div>
      )}

      {/* Titre */}
      <h1 className="text-3xl font-bold mb-4 text-blue-800">{formation.title}</h1>

      {/* Description multi-lignes */}
      <div className="text-gray-700 mb-6 leading-relaxed">
        {lignesDescription.map((ligne, index) => (
          <p key={index} className="mb-2">
            {ligne}
          </p>
        ))}
      </div>

      {/* Bouton S’inscrire */}
      {formation.preinscriptionLink && (
        <a
          href={formation.preinscriptionLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-lg font-medium mb-4"
        >
          S’inscrire
        </a>
      )}

      {/* Bouton Retour */}
      <button
        onClick={() => navigate(-1)}
        className="block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
      >
        ← Retour
      </button>
    </div>
  );
}
