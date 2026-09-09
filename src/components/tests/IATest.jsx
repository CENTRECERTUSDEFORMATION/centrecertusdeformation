// frontend/src/components/tests/IATest.jsx
import React, { useState, useEffect } from 'react';
import TestQuestion from './TestQuestion';
import TestProgress from './TestProgress';
import TestResults from './TestResults';

const IA_QUESTIONS = [
  {
    id: 1,
    category: 'Introduction à l\'IA',
    question: 'Qu\'est-ce que l\'intelligence artificielle ?',
    options: [
      'Un programme qui pense comme un humain',
      'Un système qui imite l\'intelligence humaine',
      'Un robot qui parle',
      'Un ordinateur quantique'
    ],
    correct: 1,
    explanation: 'L\'IA est un système qui imite l\'intelligence humaine.'
  },
  {
    id: 2,
    category: 'Apprentissage automatique',
    question: 'Qu\'est-ce que le Machine Learning ?',
    options: [
      'Un type de robot',
      'Une méthode où l\'ordinateur apprend à partir de données',
      'Un langage de programmation',
      'Un système d\'exploitation'
    ],
    correct: 1,
    explanation: 'Le Machine Learning est une méthode où l\'ordinateur apprend à partir de données.'
  },
  {
    id: 3,
    category: 'Réseaux de neurones',
    question: 'Qu\'est-ce qu\'un réseau de neurones artificiel ?',
    options: [
      'Un réseau de neurones biologiques',
      'Un modèle informatique inspiré du cerveau',
      'Un type de circuit électronique',
      'Un logiciel de messagerie'
    ],
    correct: 1,
    explanation: 'Un réseau de neurones artificiel est un modèle inspiré du cerveau humain.'
  },
  {
    id: 4,
    category: 'Deep Learning',
    question: 'Qu\'est-ce que le Deep Learning ?',
    options: [
      'Une méthode d\'apprentissage profond avec plusieurs couches',
      'Un type de base de données',
      'Un langage de programmation',
      'Un algorithme simple'
    ],
    correct: 0,
    explanation: 'Le Deep Learning utilise des réseaux de neurones avec plusieurs couches.'
  },
  {
    id: 5,
    category: 'IA Générative',
    question: 'Qu\'est-ce que l\'IA générative ?',
    options: [
      'Une IA qui crée du contenu (texte, images, audio)',
      'Une IA qui analyse des données',
      'Une IA qui gère des bases de données',
      'Une IA qui exécute des calculs'
    ],
    correct: 0,
    explanation: 'L\'IA générative crée du nouveau contenu comme des textes ou des images.'
  },
  {
    id: 6,
    category: 'Traitement du langage',
    question: 'Qu\'est-ce que le NLP (Natural Language Processing) ?',
    options: [
      'Un traitement qui permet aux machines de comprendre le langage humain',
      'Un type de robot',
      'Un langage de programmation',
      'Une méthode de chiffrement'
    ],
    correct: 0,
    explanation: 'Le NLP permet aux machines de comprendre et d\'analyser le langage humain.'
  },
  {
    id: 7,
    category: 'Vision par ordinateur',
    question: 'Qu\'est-ce que la vision par ordinateur ?',
    options: [
      'La capacité des machines à voir et interpréter des images',
      'Un type d\'écran',
      'Un logiciel de retouche photo',
      'Une caméra intelligente'
    ],
    correct: 0,
    explanation: 'La vision par ordinateur permet aux machines d\'interpréter des images.'
  },
  {
    id: 8,
    category: 'Données',
    question: 'Pourquoi les données sont-elles importantes en IA ?',
    options: [
      'Pour que l\'IA puisse apprendre et s\'améliorer',
      'Pour stocker des fichiers',
      'Pour gérer des bases de données',
      'Pour créer des graphiques'
    ],
    correct: 0,
    explanation: 'Les données sont le carburant qui permet à l\'IA d\'apprendre.'
  },
  {
    id: 9,
    category: 'Applications',
    question: 'Quelle application utilise l\'IA au quotidien ?',
    options: [
      'Les assistants vocaux (Siri, Alexa)',
      'Les calculatrices',
      'Les agendas',
      'Les bloc-notes'
    ],
    correct: 0,
    explanation: 'Les assistants vocaux utilisent l\'IA pour comprendre et répondre.'
  },
  {
    id: 10,
    category: 'Éthique',
    question: 'Quelle est une préoccupation éthique majeure de l\'IA ?',
    options: [
      'Les biais dans les données et les décisions',
      'Le coût des ordinateurs',
      'La consommation d\'énergie',
      'La vitesse de calcul'
    ],
    correct: 0,
    explanation: 'Les biais dans les données peuvent entraîner des décisions injustes.'
  }
];

export default function IATest({ formationId, onComplete, resetMode = false }) {
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
    const question = IA_QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: optionIndex });
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestion < IA_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const correct = IA_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = IA_QUESTIONS.length;
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

  const question = IA_QUESTIONS[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  if (showResults) {
    const correct = IA_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = IA_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';

    return (
      <TestResults
        score={correct}
        total={total}
        percentage={percentage}
        level={level}
        answers={answers}
        questions={IA_QUESTIONS}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onViewFormation={() => window.location.href = `/formations/intelligence-artificielle-pratique-monastir`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Test Intelligence Artificielle</h3>
          <p className="text-xs text-gray-400">Question {currentQuestion + 1} sur {IA_QUESTIONS.length}</p>
        </div>
        <div className="text-sm text-gray-400">
          ⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
        </div>
      </div>

      <TestProgress 
        current={currentQuestion} 
        total={IA_QUESTIONS.length} 
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
        ✅ {Object.keys(answers).length} / {IA_QUESTIONS.length} questions répondues
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
          {currentQuestion === IA_QUESTIONS.length - 1 ? '📊 Voir les résultats' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}