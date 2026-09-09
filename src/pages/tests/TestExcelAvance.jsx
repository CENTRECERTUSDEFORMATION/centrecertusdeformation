// frontend/src/pages/tests/TestExcelAvance.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { excelAvanceQuestions } from '../../data/tests/excelAvanceQuestions';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Configuration Excel
const EXCEL_VERSIONS = {
  '2016': 'Excel 2016',
  '2019': 'Excel 2019',
  '2021': 'Excel 2021',
  '365': 'Microsoft 365'
};

// Niveaux Excel
const EXCEL_LEVELS = {
  debutant: {
    label: 'Débutant',
    emoji: '📖',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Vous maîtrisez les bases d\'Excel : création de tableaux, formules simples, mise en forme.',
    recommendation: 'Nous vous recommandons de suivre la formation "Excel - Perfectionnement et Automatisation" pour consolider vos bases et apprendre les fonctionnalités avancées.',
    formation: 'Excel - Perfectionnement et Automatisation'
  },
  intermediaire: {
    label: 'Intermédiaire',
    emoji: '📚',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Vous connaissez les fonctions avancées : RECHERCHEV, SI, tableaux croisés dynamiques, mise en forme conditionnelle.',
    recommendation: 'Vous êtes prêt pour la formation "Excel Avancé - Maîtrise et Automatisation" pour aller plus loin avec VBA, Power Query et l\'automatisation.',
    formation: 'Excel Avancé - Maîtrise et Automatisation'
  },
  avance: {
    label: 'Avancé',
    emoji: '🎓',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Vous maîtrisez les fonctionnalités avancées : VBA, Power Query, INDEX/EQUIV, macros, automatisation.',
    recommendation: 'Excellent niveau ! Vous pouvez envisager la certification "Excel Expert Microsoft" ou les formations "Data Analyst avec Excel" ou "Power BI".',
    formation: 'Certification Expert Excel'
  },
  expert: {
    label: 'Expert',
    emoji: '🏆',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Vous êtes un expert Excel ! Maîtrise complète de VBA, Power Query, Power Pivot, automatisation avancée.',
    recommendation: 'Formation "Data Analyst avec Excel & Power BI" ou "Développeur VBA". Vous pouvez aussi devenir formateur Excel !',
    formation: 'Data Analyst avec Excel & Power BI'
  }
};

export default function TestExcelAvance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // État du test
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [selectedExcelVersion, setSelectedExcelVersion] = useState('365');
  
  // Références
  const timerRef = useRef(null);

  // Configuration
  const totalQuestions = 15;
  const testDuration = 12;

  // ============================================
  // INITIALISATION
  // ============================================
  useEffect(() => {
    try {
      if (!excelAvanceQuestions || excelAvanceQuestions.length === 0) {
        throw new Error('Aucune question disponible');
      }

      let availableQuestions = [...excelAvanceQuestions];
      
      while (availableQuestions.length < 90) {
        availableQuestions = availableQuestions.concat([...excelAvanceQuestions]);
      }
      
      setAllQuestions(availableQuestions);
      
      const shuffled = [...availableQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, totalQuestions);
      
      setQuestions(shuffled);
      setTimeLeft(testDuration * 60);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement questions:', error);
      toast.error('Erreur lors du chargement du test');
      setLoading(false);
    }
  }, []);

  // ============================================
  // ⏱️ GESTION DU TEMPS
  // ============================================
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (timeLeft === 0 && testStarted && !testCompleted) {
      handleSubmitTest('timeout');
    }
  }, [timeLeft, testStarted, testCompleted]);

  // ============================================
  // FONCTIONS DU TEST
  // ============================================
  const handleStartTest = () => {
    setTestStarted(true);
    toast.info('⏱️ Le test Excel Avancé commence maintenant !');
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitTest = async (reason = 'manual') => {
    if (submitting) return;
    setSubmitting(true);
    
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0 && reason !== 'timeout') {
      const confirmSubmit = window.confirm(
        `⚠️ Vous n'avez pas répondu à ${unanswered.length} question(s).\n\nVoulez-vous vraiment soumettre le test ?`
      );
      if (!confirmSubmit) {
        setSubmitting(false);
        return;
      }
    }
    
    let correct = 0;
    const detailedResults = questions.map(q => {
      const isCorrect = answers[q.id] === q.correct;
      if (isCorrect) correct++;
      return {
        ...q,
        userAnswer: answers[q.id],
        isCorrect
      };
    });

    const percentage = Math.round((correct / questions.length) * 100);
    
    let levelKey = 'debutant';
    if (percentage >= 90) levelKey = 'expert';
    else if (percentage >= 75) levelKey = 'avance';
    else if (percentage >= 50) levelKey = 'intermediaire';
    
    const level = EXCEL_LEVELS[levelKey];

    const timeSpent = Math.round(((testDuration * 60) - timeLeft) / 60);

    const resultData = {
      correct,
      total: questions.length,
      percentage,
      levelKey,
      level,
      detailedResults,
      answers,
      timeSpent,
      unanswered: unanswered.length,
      reason,
      testName: 'Excel Avancé',
      testIcon: '📊',
      excelVersion: EXCEL_VERSIONS[selectedExcelVersion] || 'Microsoft 365'
    };

    setResults(resultData);
    setTestCompleted(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (user) {
      try {
        await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            formation_id: null,
            test_type: 'excelAvance',
            score: correct,
            total_questions: questions.length,
            percentage,
            level: level.label,
            answers: answers,
            time_spent: timeSpent * 60,
            created_at: new Date().toISOString()
          });
        toast.success('✅ Résultat sauvegardé !');
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
        toast.warning('⚠️ Résultat non sauvegardé.');
      }
    }
    
    setSubmitting(false);
  };

  const handleRetry = () => {
    const shuffled = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);
    
    setQuestions(shuffled);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(testDuration * 60);
    setTestStarted(false);
    setTestCompleted(false);
    setResults(null);
    setSubmitting(false);
    setShowReview(false);
    toast.info('🔄 Nouveau test prêt !');
  };

  // ============================================
  // RENDU
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Chargement du test | Centre Certus</title>
        </Helmet>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1a56db] mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du test...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU - RÉSULTATS
  // ============================================
  if (testCompleted && results) {
    return (
      <>
        <Helmet>
          <title>Résultat Test Excel Avancé | Centre Certus</title>
          <meta name="description" content={`Résultat du test Excel Avancé : ${results.percentage}% - Niveau ${results.level.label}`} />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">📊 Résultat du test Excel</h2>
                    <p className="text-blue-100 text-sm mt-1">{results.excelVersion}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold">{results.percentage}%</span>
                    <p className="text-blue-100 text-sm">Score global</p>
                  </div>
                </div>
              </div>

              {/* Résumé */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-[#1a56db]">{results.correct}/{results.total}</div>
                    <p className="text-xs text-gray-500 mt-1">Bonnes réponses</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`text-3xl font-bold ${results.level.color}`}>
                      {results.level.emoji} {results.level.label}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Niveau</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-orange-500">{results.timeSpent} min</div>
                    <p className="text-xs text-gray-500 mt-1">Temps passé</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">
                      {results.unanswered === 0 ? '✅' : '⚠️'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {results.unanswered === 0 ? 'Toutes répondues' : `${results.unanswered} non répondues`}
                    </p>
                  </div>
                </div>

                {/* Détail du niveau */}
                <div className={`${results.level.bgColor} rounded-xl p-6 mb-6`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{results.level.emoji}</div>
                    <div>
                      <h3 className={`text-xl font-bold ${results.level.color}`}>
                        Niveau {results.level.label}
                      </h3>
                      <p className="text-gray-700 mt-1">{results.level.description}</p>
                    </div>
                  </div>
                </div>

                {/* Recommandation */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <span>💡</span> Recommandation
                  </h4>
                  <p className="text-blue-700">{results.level.recommendation}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/formations')}
                      className="bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1a56db]/90 transition"
                    >
                      Voir la formation recommandée
                    </button>
                    <button
                      onClick={() => navigate('/contact')}
                      className="bg-[#76c21f] text-white px-4 py-2 rounded-lg hover:bg-[#76c21f]/90 transition"
                    >
                      Contacter un conseiller
                    </button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRetry}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    🔄 Refaire le test
                  </button>
                  <button
                    onClick={() => setShowReview(!showReview)}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    📝 {showReview ? 'Masquer' : 'Voir'} les détails des questions
                  </button>
                  {!user && (
                    <button
                      onClick={() => navigate('/inscription?formation=excel-avance&test=completed')}
                      className="bg-[#1a56db] text-white px-6 py-3 rounded-xl hover:bg-[#1a56db]/90 transition flex items-center gap-2"
                    >
                      📝 S'inscrire pour sauvegarder
                    </button>
                  )}
                </div>

                {/* Revue des questions */}
                {showReview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 border-t pt-6"
                  >
                    <h4 className="font-semibold text-gray-800 mb-4">📋 Détail des réponses</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {results.detailedResults.map((q, index) => (
                        <div key={q.id} className={`p-4 rounded-xl border ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {index + 1}. {q.question}
                              </p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p className="text-gray-600">
                                  Votre réponse : {q.userAnswer !== undefined ? q.options[q.userAnswer] : 'Non répondue'}
                                </p>
                                {!q.isCorrect && (
                                  <p className="text-green-600">
                                    ✅ Bonne réponse : {q.options[q.correct]}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {q.isCorrect ? (
                                <span className="text-green-500 text-xl">✅</span>
                              ) : (
                                <span className="text-red-500 text-xl">❌</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDU - DÉMARRAGE
  // ============================================
  if (!testStarted) {
    return (
      <>
        <Helmet>
          <title>Test Excel Avancé | Centre Certus</title>
          <meta name="description" content="Testez gratuitement votre niveau en Excel Avancé" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Test de niveau - Excel Avancé
              </h1>
              <p className="text-gray-500 mb-6">
                Évaluez gratuitement votre niveau en Excel avec {totalQuestions} questions aléatoires
              </p>

              {/* Sélection de la version Excel */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Excel utilisée :
                </label>
                <select
                  value={selectedExcelVersion}
                  onChange={(e) => setSelectedExcelVersion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                >
                  {Object.entries(EXCEL_VERSIONS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{testDuration} min</div>
                  <div className="text-xs text-gray-500">Durée</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <div className="text-xs text-gray-500">Niveaux</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">90</div>
                  <div className="text-xs text-gray-500">Questions disponibles</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  ℹ️ Chaque test contient <strong>{totalQuestions} questions aléatoires</strong> parmi 90 questions disponibles.
                  Vous pouvez refaire le test plusieurs fois avec des questions différentes.
                </p>
              </div>

              <button
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                🚀 Commencer le test
              </button>

              <button
                onClick={() => navigate('/formations')}
                className="mt-3 text-gray-500 hover:text-gray-700 transition text-sm"
              >
                ← Retour aux formations
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDU - QUESTIONS
  // ============================================
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Erreur de chargement | Centre Certus</title>
        </Helmet>
        <div className="text-center">
          <p className="text-gray-500">Erreur de chargement du test</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#1a56db] text-white px-4 py-2 rounded-lg"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <Helmet>
        <title>{`Test Excel Avancé - Question ${currentQuestionIndex + 1}/${questions.length}`}</title>
        <meta name="description" content={`Question ${currentQuestionIndex + 1} du test Excel Avancé`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Barre de progression */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {answeredCount}/{questions.length} répondues
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                  ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[#1a56db] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {currentQuestion.category || 'Général'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {currentQuestion.difficulty || 'Débutant'}
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Niveau {currentQuestion.level || 'Débutant'}
              </span>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-6">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-[#1a56db] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                  {answers[currentQuestion.id] === index && (
                    <span className="float-right text-[#1a56db]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Précédent
            </button>

            <div className="flex gap-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#1a56db] text-white rounded-lg font-medium hover:bg-[#1a56db]/90 transition"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={() => handleSubmitTest('manual')}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#76c21f] text-white rounded-lg font-medium hover:bg-[#76c21f]/90 transition disabled:opacity-50"
                >
                  {submitting ? 'Soumission...' : '📊 Voir les résultats'}
                </button>
              )}
            </div>
          </div>

          {/* Indicateur de progression */}
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, index) => (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition ${
                  index === currentQuestionIndex
                    ? 'bg-[#1a56db] text-white scale-110 shadow-md'
                    : answers[q.id] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Avertissement de temps */}
          {timeLeft < 60 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center animate-pulse">
              <p className="text-red-600 font-medium">
                ⚠️ Temps presque écoulé ! {minutes}m{seconds}s restantes
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}