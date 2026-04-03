// src/components/FormationCard.jsx
import React from 'react';

function FormationCard({ formation }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-bold mb-2">{formation.titre}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {formation.description || 'Pas de description disponible.'}
      </p>
      <p className="text-sm text-gray-800">
        <strong>Durée :</strong> {formation.duree || 'Non spécifiée'}
      </p>
      <p className="text-sm text-gray-800">
        <strong>Lieu :</strong> {formation.lieu || 'Non spécifié'}
      </p>
      <p className="text-sm text-gray-800">
        <strong>Public :</strong> {formation.publicCible || 'Tous'}
      </p>
      {formation.lienInscription && (
        <p className="mt-2">
          <a
            href={formation.lienInscription}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            Lien d'inscription
          </a>
        </p>
      )}
      {formation.imageBase64 && (
        <img
          src={formation.imageBase64}
          alt={formation.titre}
          className="w-full h-40 object-cover rounded mt-4"
        />
      )}
    </div>
  );
}

export default FormationCard;
