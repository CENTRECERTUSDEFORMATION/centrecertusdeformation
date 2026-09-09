// frontend/src/components/tests/PythonTest.jsx
import React, { useState, useEffect } from 'react';
import TestQuestion from './TestQuestion';
import TestProgress from './TestProgress';
import TestResults from './TestResults';

const PYTHON_QUESTIONS = [
  {
    id: 1,
    category: 'Bases de Python',
    question: 'Quelle est la fonction pour afficher du texte en Python ?',
    options: ['print()', 'echo()', 'console.log()', 'System.out.println()'],
    correct: 0,
    explanation: 'La fonction print() est utilisée pour afficher du texte en Python.'
  },
  {
    id: 2,
    category: 'Variables',
    question: 'Quel est le type de la variable suivante : x = 5 ?',
    options: ['int', 'float', 'str', 'bool'],
    correct: 0,
    explanation: 'x = 5 est un entier (int) en Python.'
  },
  {
    id: 3,
    category: 'Structures de contrôle',
    question: 'Quelle est la syntaxe correcte pour une boucle for en Python ?',
    options: [
      'for i in range(10):',
      'for (i=0; i<10; i++)',
      'for i=0 to 10',
      'foreach i in range(10)'
    ],
    correct: 0,
    explanation: 'La syntaxe correcte est "for i in range(10):" avec deux-points.'
  },
  {
    id: 4,
    category: 'Listes',
    question: 'Comment accéder au premier élément d\'une liste Python ?',
    options: ['ma_liste[0]', 'ma_liste[1]', 'ma_liste.first()', 'ma_liste.get(0)'],
    correct: 0,
    explanation: 'Les listes Python sont indexées à partir de 0.'
  },
  {
    id: 5,
    category: 'Fonctions',
    question: 'Comment définir une fonction en Python ?',
    options: [
      'def ma_fonction():',
      'function ma_fonction()',
      'ma_fonction() = def',
      'define ma_fonction()'
    ],
    correct: 0,
    explanation: 'On utilise le mot-clé "def" pour définir une fonction en Python.'
  },
  {
    id: 6,
    category: 'Chaînes de caractères',
    question: 'Comment concaténer deux chaînes en Python ?',
    options: ['"Bonjour" + "Monde"', '"Bonjour" & "Monde"', '"Bonjour" . "Monde"', '"Bonjour" concat "Monde"'],
    correct: 0,
    explanation: 'On utilise l\'opérateur + pour concaténer des chaînes en Python.'
  },
  {
    id: 7,
    category: 'Conditions',
    question: 'Quelle est la syntaxe correcte pour une condition IF en Python ?',
    options: ['if x > 5:', 'if (x > 5)', 'if x > 5 then', 'if x > 5 {'],
    correct: 0,
    explanation: 'La syntaxe correcte est "if x > 5:" avec deux-points.'
  },
  {
    id: 8,
    category: 'Bibliothèques',
    question: 'Comment importer la bibliothèque math en Python ?',
    options: ['import math', 'include math', 'using math', 'require math'],
    correct: 0,
    explanation: 'On utilise "import math" pour importer une bibliothèque en Python.'
  },
  {
    id: 9,
    category: 'Dictionnaires',
    question: 'Comment créer un dictionnaire en Python ?',
    options: [
      'mon_dict = {"cle": "valeur"}',
      'mon_dict = {"cle" => "valeur"}',
      'mon_dict = {"cle": "valeur"};',
      'mon_dict = {"cle" = "valeur"}'
    ],
    correct: 0,
    explanation: 'On utilise les accolades {} avec des paires clé:valeur.'
  },
  {
    id: 10,
    category: 'Exceptions',
    question: 'Comment gérer une exception en Python ?',
    options: [
      'try: ... except:',
      'try { } catch { }',
      'try: ... catch:',
      'try { } except { }'
    ],
    correct: 0,
    explanation: 'On utilise try/except pour gérer les exceptions en Python.'
  }
];

export default function PythonTest({ formationId, onComplete, resetMode = false }) {
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
    const question = PYTHON_QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: optionIndex });
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestion < PYTHON_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const correct = PYTHON_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = PYTHON_QUESTIONS.length;
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

  const question = PYTHON_QUESTIONS[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  if (showResults) {
    const correct = PYTHON_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = PYTHON_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';

    return (
      <TestResults
        score={correct}
        total={total}
        percentage={percentage}
        level={level}
        answers={answers}
        questions={PYTHON_QUESTIONS}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onViewFormation={() => window.location.href = `/formations/python-programmation-certifiante-monastir`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Test Python</h3>
          <p className="text-xs text-gray-400">Question {currentQuestion + 1} sur {PYTHON_QUESTIONS.length}</p>
        </div>
        <div className="text-sm text-gray-400">
          ⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
        </div>
      </div>

      <TestProgress 
        current={currentQuestion} 
        total={PYTHON_QUESTIONS.length} 
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
        ✅ {Object.keys(answers).length} / {PYTHON_QUESTIONS.length} questions répondues
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
          {currentQuestion === PYTHON_QUESTIONS.length - 1 ? '📊 Voir les résultats' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}