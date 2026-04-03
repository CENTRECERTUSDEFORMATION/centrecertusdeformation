import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function EspaceParticipant() {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [messageAdmin, setMessageAdmin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDataAndFormations = async () => {
      if (!user || !user.token) return;

      try {
        // Récupérer les infos de l'utilisateur connecté
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const userData = userRes.data;
        setMessageAdmin(userData.adminMessage || '');

        // Récupérer toutes les formations disponibles (public)
        const formationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/formations`);
        setFormations(formationsRes.data || []);

        setError('');
      } catch (err) {
        console.error('Erreur dans EspaceParticipant.jsx :', err);
        setError('Impossible de récupérer vos données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndFormations();
  }, [user]);

  if (!user) {
    return (
      <p className="text-center text-red-600">
        Vous devez être connecté pour accéder à cette page.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">
        Bienvenue dans votre espace, {user.fullName}
      </h2>

      {loading ? (
        <p className="text-gray-500">Chargement de vos données...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* Section Formations */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">📚 Formations proposées :</h3>
            {formations.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-800">
                {formations.map((formation) => (
                  <li key={formation._id}>
                    <strong>{formation.title}</strong>{' '}
                    {formation.date && (
                      <span className="text-sm text-gray-600">– {formation.date}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Aucune formation disponible pour le moment.</p>
            )}
          </div>

          {/* Message personnalisé de l'admin */}
          {messageAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-yellow-800 mb-2">📩 Message de l’administrateur :</h4>
              <pre className="whitespace-pre-wrap text-gray-700">{messageAdmin}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
