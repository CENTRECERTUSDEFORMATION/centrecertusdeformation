// frontend/src/components/tests/TestManager.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { supabaseSelect } from '../../supabaseFetch';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Imports lazy des différents tests
const ExcelTest = lazy(() => import('./ExcelTest'));
const PythonTest = lazy(() => import('./PythonTest'));
const IATest = lazy(() => import('./IATest'));
const LanguesTest = lazy(() => import('./LanguesTest'));
const DefaultTest = lazy(() => import('./DefaultTest'));

const TEST_COMPONENTS = {
  excel: ExcelTest,
  python: PythonTest,
  ia: IATest,
  langues: LanguesTest,
  default: DefaultTest
};

const TestLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Chargement du test...</span>
  </div>
);

export default function TestManager({ formation }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInscrit, setIsInscrit] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  const { 
    has_test, 
    test_type, 
    test_questions_count, 
    test_duration, 
    title,
    id: formationId,
    test_free,
    slug
  } = formation || {};

  // ============================================
  // FONCTION POUR OUVRIR LE TEST DANS UNE NOUVELLE FENÊTRE
  // ============================================
  const openTestWindow = () => {
    const testUrl = `/test/${slug || formationId}`;
    window.open(testUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  };

  // ============================================
  // FONCTION POUR OUVRIR L'INSCRIPTION DANS UNE NOUVELLE FENÊTRE
  // ============================================
  const openInscriptionWindow = () => {
    const inscriptionUrl = `/inscription?redirect=/test/${slug || formationId}&test=completed&formation=${formationId}`;
    window.open(inscriptionUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  };

  // Vérifier si l'utilisateur est inscrit
  useEffect(() => {
    const checkInscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const inscription = await supabaseSelect("inscriptions", {
          filter: `user_id=eq.${user.id}&formation_id=eq.${formationId}`
        });

        setIsInscrit(inscription && inscription.length > 0);

        if (inscription && inscription.length > 0) {
          const results = await supabaseSelect("test_results", {
            filter: `user_id=eq.${user.id}&formation_id=eq.${formationId}`
          });
          
          if (results && results.length > 0) {
            setHasResult(true);
            setResult(results[0]);
          }
        }
      } catch (error) {
        console.error("Erreur vérification:", error);
      } finally {
        setLoading(false);
      }
    };

    checkInscription();
  }, [user, formationId]);

  // Sauvegarder le résultat du test et rediriger
  const saveTestResult = async (testData) => {
    // Si l'utilisateur n'est pas connecté, stocker le résultat temporairement
    if (!user) {
      sessionStorage.setItem('test_result', JSON.stringify({
        ...testData,
        formationId,
        test_type,
        formationTitle: title
      }));
      
      toast.info("📝 Créez un compte pour sauvegarder votre résultat");
      openInscriptionWindow();
      return;
    }

    try {
      // Sauvegarder le résultat
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          formation_id: formationId,
          test_type: test_type,
          score: testData.correct,
          total_questions: testData.total,
          percentage: testData.percentage,
          level: testData.level,
          answers: testData.answers,
          time_spent: testData.timeSpent
        })
        .select();

      if (error) throw error;

      setHasResult(true);
      setResult(data[0]);
      setLatestResult(testData);
      
      // Afficher le modal de succès
      setShowSuccessModal(true);
      
      // Si l'utilisateur est inscrit, rediriger vers espace participant
      if (isInscrit) {
        toast.success("✅ Test terminé ! Redirection vers votre espace...");
        setTimeout(() => {
          navigate('/espace-participant');
        }, 1500);
      } else {
        toast.success("✅ Test terminé ! Inscrivez-vous pour voir vos résultats");
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("❌ Erreur lors de la sauvegarde");
    }
  };

  // Rediriger vers l'espace participant
  const handleRedirectToEspace = () => {
    navigate('/espace-participant');
  };

  // Modal de succès
  const SuccessModal = () => {
    const levelColors = {
      'Avancé': 'bg-green-100 text-green-700 border-green-200',
      'Intermédiaire': 'bg-orange-100 text-orange-700 border-orange-200',
      'Débutant': 'bg-blue-100 text-blue-700 border-blue-200'
    };

    const levelEmojis = {
      'Avancé': '🏆',
      'Intermédiaire': '📊',
      'Débutant': '📚'
    };

    const levelMessages = {
      'Avancé': 'Félicitations ! Vous avez un excellent niveau.',
      'Intermédiaire': 'Bonnes bases ! Continuez à progresser.',
      'Débutant': 'Pas de panique ! Commencez par les bases.'
    };

    if (!latestResult) return null;

    const level = latestResult.level || 'Débutant';

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Test terminé !</h3>
            
            {/* Score */}
            <div className={`rounded-xl p-4 mb-4 border ${levelColors[level] || 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">{levelEmojis[level] || '📚'}</span>
                <div>
                  <p className="text-3xl font-bold">
                    {latestResult.correct}/{latestResult.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    {latestResult.percentage}% • Niveau {level}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-600">
                {levelMessages[level] || 'Continuez à progresser !'}
              </p>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {user 
                ? 'Vos résultats ont été sauvegardés !' 
                : 'Créez un compte pour sauvegarder vos résultats et suivre votre progression.'}
            </p>

            <div className="flex flex-col gap-3">
              {!user && (
                <button
                  onClick={openInscriptionWindow}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  📝 Créer un compte pour voir mes résultats
                </button>
              )}
              
              {user && !isInscrit && (
                <button
                  onClick={openInscriptionWindow}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  📝 S'inscrire à la formation
                </button>
              )}

              {user && isInscrit && (
                <button
                  onClick={handleRedirectToEspace}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  👤 Voir mes résultats
                </button>
              )}

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Continuer sur la formation
              </button>

              {/* ✅ Bouton pour refaire le test dans une nouvelle fenêtre */}
              <button
                onClick={openTestWindow}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                🔄 Refaire le test
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (!has_test) {
    return null;
  }

  // ============================================
  // AFFICHAGE : TEST RÉSERVÉ AUX INSCRITS
  // ============================================
  if (!isInscrit && !test_free) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 border-t border-gray-200 pt-8"
      >
        <div className="text-center py-8 bg-gray-50 rounded-2xl">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Test réservé aux inscrits
          </h3>
          <p className="text-gray-600 mb-4">
            Inscrivez-vous à la formation pour accéder au test de niveau.
          </p>
          {/* ✅ Bouton S'inscrire - Nouvelle fenêtre */}
          <button 
            onClick={openInscriptionWindow}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            📝 S'inscrire
          </button>
        </div>
      </motion.div>
    );
  }

  // ============================================
  // AFFICHAGE : TEST DÉJÀ COMPLÉTÉ
  // ============================================
  if (hasResult && result) {
    const levelColors = {
      'Avancé': 'bg-green-100 text-green-700',
      'Intermédiaire': 'bg-orange-100 text-orange-700',
      'Débutant': 'bg-blue-100 text-blue-700'
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 border-t border-gray-200 pt-8"
      >
        <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-200">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Test déjà complété !
          </h3>
          <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-xl shadow-md">
            <span className="text-2xl font-bold text-green-600">
              {result.score}/{result.total_questions}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-lg font-semibold text-gray-700">
              {result.percentage}%
            </span>
            <span className="text-gray-400">|</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[result.level] || 'bg-gray-100 text-gray-700'}`}>
              {result.level}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            🕐 Test effectué le {new Date(result.created_at).toLocaleDateString('fr-FR')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {/* ✅ Bouton Refaire le test - Nouvelle fenêtre */}
            <button
              onClick={openTestWindow}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              🔄 Refaire le test
            </button>
            <button
              onClick={() => navigate('/espace-participant')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
            >
              👤 Voir dans mon espace
            </button>
          </div>
        </div>

        {showTest && (
          <div className="mt-6">
            <Suspense fallback={<TestLoader />}>
              {(() => {
                const TestComponent = TEST_COMPONENTS[test_type] || TEST_COMPONENTS.default;
                return (
                  <TestComponent 
                    formationId={formationId}
                    onComplete={saveTestResult}
                    resetMode={true}
                  />
                );
              })()}
            </Suspense>
          </div>
        )}
      </motion.div>
    );
  }

  // ============================================
  // AFFICHAGE : TEST DISPONIBLE
  // ============================================
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 border-t border-gray-200 pt-8"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <span>📝</span> Test de niveau {test_free && <span className="text-green-600">(Gratuit)</span>}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Testez vos connaissances en {title}
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Répondez aux {test_questions_count || 10} questions pour évaluer votre niveau 
            et obtenir une recommandation personnalisée.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
            <span>⏱️ Durée estimée : {test_duration || 5} minutes</span>
            <span>📊 {test_questions_count || 10} questions</span>
            {user ? (
              <span className="text-green-600">✅ Connecté</span>
            ) : (
              <span className="text-orange-600">⚠️ Connectez-vous pour sauvegarder</span>
            )}
          </div>
          {/* ✅ Bouton pour ouvrir le test dans une nouvelle fenêtre */}
          <button
            onClick={openTestWindow}
            className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <span>🧪</span> Commencer le test
            <span className="text-xs opacity-80">(nouvelle fenêtre)</span>
          </button>
        </div>

        <Suspense fallback={<TestLoader />}>
          {(() => {
            const TestComponent = TEST_COMPONENTS[test_type] || TEST_COMPONENTS.default;
            return (
              <TestComponent 
                formationId={formationId}
                onComplete={saveTestResult}
              />
            );
          })()}
        </Suspense>
      </motion.div>

      {/* Modal de succès */}
      {showSuccessModal && <SuccessModal />}
    </>
  );
}