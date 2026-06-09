// frontend/src/pages/ConfirmInscription.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

export default function ConfirmInscription() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formationId = searchParams.get('formation');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading');
  const [formationTitle, setFormationTitle] = useState('');

  useEffect(() => {
    const checkAndInscribe = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setStatus('error');
          toast.error("Veuillez vous connecter pour finaliser votre inscription");
          setTimeout(() => navigate('/connexion'), 2000);
          return;
        }

        if (formationId) {
          const { data: formation } = await supabase
            .from('formations')
            .select('title')
            .eq('id', formationId)
            .single();
          if (formation) setFormationTitle(formation.title);

          const { data: existing } = await supabase
            .from('inscriptions')
            .select('id, statut')
            .eq('user_id', user.id)
            .eq('formation_id', formationId)
            .maybeSingle();

          if (existing) {
            setStatus('already_exists');
            toast.info("Vous êtes déjà inscrit à cette formation");
            setTimeout(() => navigate('/espace-participant'), 2000);
            return;
          }

          const { error: insertError } = await supabase
            .from('inscriptions')
            .insert({
              user_id: user.id,
              formation_id: formationId,
              statut: 'en_attente',
              created_at: new Date().toISOString()
            });

          if (insertError) throw insertError;

          setStatus('success');
          toast.success(`✅ Inscription à "${formationTitle}" enregistrée !`);
        } else {
          setStatus('success');
        }

        setTimeout(() => navigate('/espace-participant'), 3000);
      } catch (err) {
        console.error(err);
        setStatus('error');
        toast.error("Une erreur est survenue");
        setTimeout(() => navigate('/espace-participant'), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAndInscribe();
  }, [formationId, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1a56db] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Finalisation de l'inscription...</h2>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscription confirmée !</h1>
          <p className="text-gray-600 mb-4">Votre inscription à <span className="font-semibold">{formationTitle || "la formation"}</span> a bien été enregistrée.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-700">⏳ En attente de validation par l'administrateur.</p>
          </div>
          <div className="animate-pulse text-gray-400 text-sm">Redirection...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
        <p className="text-gray-600 mb-4">Une erreur est survenue lors de l'inscription.</p>
        <button onClick={() => navigate('/formations')} className="bg-[#1a56db] text-white px-6 py-2 rounded-lg">Retour aux formations</button>
      </motion.div>
    </div>
  );
}