// frontend/src/pages/TestFormation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function TestFormation() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Liste des slugs qui ont un test dédié
  const dedicatedTests = {
    'excel-avance-monastir': '/test/excel-avance',
    'excel-avance-formation-perfectionnement-et-automatisation-ce': '/test/excel-avance',
    'excel-avance': '/test/excel-avance',
  };

  useEffect(() => {
    // ✅ Vérifier si le slug correspond à un test dédié
    if (dedicatedTests[slug]) {
      navigate(dedicatedTests[slug]);
      return;
    }

    // ✅ Vérifier si c'est une formation Excel (contient "excel" ou "Excel")
    if (slug && (slug.includes('excel') || slug.includes('Excel'))) {
      navigate('/test/excel-avance');
      return;
    }

    const fetchFormation = async () => {
      try {
        const { data, error } = await supabase
          .from('formations')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        if (!data.has_test) {
          toast.warning('Cette formation ne propose pas de test');
          navigate(`/formations/${slug}`);
          return;
        }
        
        setFormation(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Formation non trouvée');
        navigate('/formations');
      } finally {
        setLoading(false);
      }
    };
    fetchFormation();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  if (!formation) return null;

  return (
    <>
      <Helmet>
        <title>Test de niveau | Centre Certus de Formation</title>
        <meta name="description" content={`Testez gratuitement votre niveau en ${formation.title}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🧪</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Test de niveau - {formation.title}
            </h1>
            <p className="text-gray-500 mb-6">
              Cette formation propose un test de niveau gratuit
            </p>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-blue-800">
                Le test de niveau pour cette formation n'est pas encore configuré.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Veuillez contacter l'administrateur pour plus d'informations.
              </p>
            </div>

            <button
              onClick={() => navigate(`/formations/${formation.slug}`)}
              className="bg-[#1a56db] text-white px-6 py-3 rounded-xl hover:bg-[#1a56db]/90 transition"
            >
              ← Retour à la formation
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}