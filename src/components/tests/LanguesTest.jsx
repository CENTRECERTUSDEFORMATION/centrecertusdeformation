// frontend/src/components/tests/LanguesTest.jsx
import React, { useState, useEffect } from 'react';
import TestQuestion from './TestQuestion';
import TestProgress from './TestProgress';
import TestResults from './TestResults';

const LANGUES_QUESTIONS = [
  {
    id: 1,
    category: 'Vocabulaire Anglais',
    question: 'Comment dit-on "Bonjour" en anglais ?',
    options: ['Hello', 'Bonjour', 'Hola', 'Ciao'],
    correct: 0,
    explanation: '"Hello" est la traduction anglaise de "Bonjour".'
  },
  {
    id: 2,
    category: 'Vocabulaire Anglais',
    question: 'Comment dit-on "Merci" en anglais ?',
    options: ['Thank you', 'Gracias', 'Danke', 'Merci'],
    correct: 0,
    explanation: '"Thank you" est la traduction anglaise de "Merci".'
  },
  {
    id: 3,
    category: 'Grammaire Anglais',
    question: 'Quelle est la forme correcte du verbe "to be" pour "I" ?',
    options: ['am', 'is', 'are', 'be'],
    correct: 0,
    explanation: '"I am" est la forme correcte pour le pronom "I".'
  },
  {
    id: 4,
    category: 'Vocabulaire Espagnol',
    question: 'Comment dit-on "Bonjour" en espagnol ?',
    options: ['Hola', 'Hello', 'Bonjour', 'Ciao'],
    correct: 0,
    explanation: '"Hola" est la traduction espagnole de "Bonjour".'
  },
  {
    id: 5,
    category: 'Vocabulaire Allemand',
    question: 'Comment dit-on "Bonjour" en allemand ?',
    options: ['Guten Tag', 'Hola', 'Hello', 'Bonjour'],
    correct: 0,
    explanation: '"Guten Tag" est la traduction allemande de "Bonjour".'
  },
  {
    id: 6,
    category: 'Vocabulaire Italien',
    question: 'Comment dit-on "Bonjour" en italien ?',
    options: ['Ciao', 'Hola', 'Hello', 'Bonjour'],
    correct: 0,
    explanation: '"Ciao" est la traduction italienne de "Bonjour".'
  },
  {
    id: 7,
    category: 'Compréhension',
    question: 'Que signifie "Good morning" ?',
    options: ['Bonjour (matin)', 'Bonsoir', 'Bonne nuit', 'Au revoir'],
    correct: 0,
    explanation: '"Good morning" signifie "Bonjour" le matin.'
  },
  {
    id: 8,
    category: 'Compréhension',
    question: 'Que signifie "Buenos días" ?',
    options: ['Bonjour (matin)', 'Bonsoir', 'Bonne nuit', 'Au revoir'],
    correct: 0,
    explanation: '"Buenos días" signifie "Bonjour" le matin en espagnol.'
  },
  {
    id: 9,
    category: 'Compréhension',
    question: 'Que signifie "Guten Abend" ?',
    options: ['Bonsoir', 'Bonjour', 'Bonne nuit', 'Au revoir'],
    correct: 0,
    explanation: '"Guten Abend" signifie "Bonsoir" en allemand.'
  },
  {
    id: 10,
    category: 'Culture',
    question: 'Dans quel pays parle-t-on espagnol ?',
    options: ['Espagne', 'France', 'Allemagne', 'Italie'],
    correct: 0,
    explanation: 'L\'espagnol est la langue officielle de l\'Espagne.'
  }
];

export default function LanguesTest({ formationId, onComplete, resetMode = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!showResults && !resetMode) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, startTime, resetMode]);

  const handleAnswer = (optionIndex) => {
    const question = LANGUES_QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: optionIndex });
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestion < LANGUES_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const correct = LANGUES_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = LANGUES_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';
    
    const result = { correct, total, percentage, level, answers, timeSpent };
    setShowResults(true);
    
    if (onComplete) {
      onComplete(result);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeSpent(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const question = LANGUES_QUESTIONS[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  if (showResults) {
    const correct = LANGUES_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = LANGUES_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';

    return (
      <TestResults
        score={correct}
        total={total}
        percentage={percentage}
        level={level}
        answers={answers}
        questions={LANGUES_QUESTIONS}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onViewFormation={() => window.location.href = `/formations`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Test Langues</h3>
          <p className="text-xs text-gray-400">Question {currentQuestion + 1} sur {LANGUES_QUESTIONS.length}</p>
        </div>
        <div className="text-sm text-gray-400">
          ⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
        </div>
      </div>

      <TestProgress 
        current={currentQuestion} 
        total={LANGUES_QUESTIONS.length} 
        answered={answers} 
      />

      <TestQuestion
        question={question}
        selectedOption={selectedOption}
        onSelect={handleAnswer}
        isAnswered={isAnswered}
        showExplanation={showExplanation}
      />

      <div className="mt-4 text-sm text-gray-400">
        ✅ {Object.keys(answers).length} / {LANGUES_QUESTIONS.length} questions répondues
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            isAnswered
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestion === LANGUES_QUESTIONS.length - 1 ? '📊 Voir les résultats' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}