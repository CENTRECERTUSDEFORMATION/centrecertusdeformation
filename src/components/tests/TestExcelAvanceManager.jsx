// src/components/tests/TestExcelAvanceManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { excelAvanceQuestions, excelAvanceConfig } from '../../data/tests/excelAvanceQuestions';
import { toast } from 'react-toastify';
import TestProgress from './TestProgress';
import TestQuestion from './TestQuestion';
import TestResults from './TestResults';

export default function TestExcelAvanceManager({ onComplete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // État du test
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formation, setFormation] = useState(null);
  
  // ✅ Références pour la sécurité
  const timerRef = useRef(null);
  const pageActiveRef = useRef(true);
  const inactivityWarnedRef = useRef(false);
  const inactivityTimeoutRef = useRef(null);

  // Configuration
  const totalQuestions = excelAvanceConfig.defaultQuestionsCount;
  const testDuration = excelAvanceConfig.defaultDuration;

  // ============================================
  // INITIALISATION
  // ============================================
  useEffect(() => {
    const shuffled = [...excelAvanceQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);
    setQuestions(shuffled);
    setTimeLeft(testDuration * 60);
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
  // 👁️ DÉTECTION DE VISIBILITÉ
  // ============================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pageActiveRef.current = false;
        if (testStarted && !testCompleted && !inactivityWarnedRef.current) {
          inactivityWarnedRef.current = true;
          toast.warning('⚠️ Restez sur la page pendant le test !');
        }
      } else {
        pageActiveRef.current = true;
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
          inactivityTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, testCompleted]);

  // ============================================
  // 🚫 DÉTECTION D'INACTIVITÉ
  // ============================================
  useEffect(() => {
    const handleUserActivity = () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      if (pageActiveRef.current && testStarted && !testCompleted) {
        inactivityTimeoutRef.current = setTimeout(() => {
          if (testStarted && !testCompleted) {
            toast.warning('⚠️ Avez-vous toujours besoin d\'aide ?');
          }
        }, 30000);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [testStarted, testCompleted]);

  // ============================================
  // 🚫 EMPÊCHER LE REFRAÎCHISSEMENT
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted && !testCompleted) {
        e.preventDefault();
        e.returnValue = '⚠️ Vous êtes sur le point de quitter le test.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testStarted, testCompleted]);

  // ============================================
  // 🚫 EMPÊCHER LES RACCOURCIS CLAVIER
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (testStarted && !testCompleted) {
        if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
          e.preventDefault();
          toast.warning('❌ Rechargement désactivé');
          return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
          e.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [testStarted, testCompleted]);

  // ============================================
  // FONCTIONS DU TEST
  // ============================================
  const handleStartTest = () => {
    setTestStarted(true);
    toast.info('⏱️ Le test Excel Avancé commence maintenant !');
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
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
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });

    const percentage = Math.round((correct / questions.length) * 100);
    
    let level = 'Débutant';
    let levelColor = 'text-gray-600';
    let levelEmoji = '📖';
    if (percentage >= 80) {
      level = 'Avancé';
      levelColor = 'text-purple-600';
      levelEmoji = '🎓';
    } else if (percentage >= 60) {
      level = 'Intermédiaire';
      levelColor = 'text-blue-600';
      levelEmoji = '📚';
    } else if (percentage >= 40) {
      level = 'Débutant confirmé';
      levelColor = 'text-green-600';
      levelEmoji = '🌱';
    }

    const timeSpent = Math.round(((testDuration * 60) - timeLeft) / 60);

    const resultData = {
      correct,
      total: questions.length,
      percentage,
      level,
      levelColor,
      levelEmoji,
      answers,
      timeSpent,
      unanswered: unanswered.length,
      reason,
      testName: 'Excel Avancé',
      testIcon: '📊'
    };

    setResults(resultData);
    setTestCompleted(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Sauvegarder le résultat
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
            level,
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
    if (onComplete) onComplete(resultData);
  };

  // ============================================
  // RENDU
  // ============================================
  if (testCompleted && results) {
    return (
      <TestResults 
        results={results}
        formation={{ title: 'Excel Avancé', testName: 'Excel Avancé' }}
        user={user}
        onRetry={() => {
          setTestCompleted(false);
          setResults(null);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setTimeLeft(testDuration * 60);
          setTestStarted(false);
          setSubmitting(false);
          pageActiveRef.current = true;
          inactivityWarnedRef.current = false;
          const shuffled = [...excelAvanceQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, totalQuestions);
          setQuestions(shuffled);
        }}
      />
    );
  }

  if (!testStarted) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Test de niveau - Excel Avancé
        </h2>
        <p className="text-gray-500 mb-4">
          Évaluez gratuitement votre niveau en Excel Avancé
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Informations :</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>📝 {questions.length} questions</li>
            <li>⏱️ {testDuration} minutes</li>
            <li>🎯 Résultat immédiat</li>
            <li>✅ Test gratuit</li>
          </ul>
        </div>

        <button
          onClick={handleStartTest}
          className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
        >
          🚀 Commencer le test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="p-4">
      <TestProgress
        current={currentQuestionIndex + 1}
        total={questions.length}
        progress={progress}
        timeLeft={timeLeft}
      />

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          {answeredCount}/{questions.length} répondues
        </span>
        {timeLeft < 60 && (
          <span className="text-sm text-red-600 animate-pulse">
            ⏱️ Temps presque écoulé !
          </span>
        )}
      </div>

      {currentQuestion && (
        <TestQuestion
          question={currentQuestion}
          index={currentQuestionIndex}
          total={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          onSelectAnswer={(optionIndex) => 
            handleSelectAnswer(currentQuestion.id, optionIndex)
          }
        />
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          ← Précédent
        </button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1a56db]/90 transition"
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={() => handleSubmitTest('manual')}
            disabled={submitting}
            className="px-6 py-2 bg-[#76c21f] text-white rounded-lg hover:bg-[#76c21f]/90 transition disabled:opacity-50"
          >
            {submitting ? 'Soumission...' : '📊 Voir les résultats'}
          </button>
        )}
      </div>

      {/* Avertissement d'inactivité */}
      {!pageActiveRef.current && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-pulse">
          ⚠️ Veuillez rester sur cette page pour continuer le test
        </div>
      )}
    </div>
  );
}