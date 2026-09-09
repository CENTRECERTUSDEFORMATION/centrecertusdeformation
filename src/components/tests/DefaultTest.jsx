// frontend/src/components/tests/DefaultTest.jsx
import React, { useState, useEffect } from 'react';
import TestQuestion from './TestQuestion';
import TestProgress from './TestProgress';
import TestResults from './TestResults';

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    category: 'Général',
    question: 'Quelle est votre expérience avec les outils informatiques ?',
    options: [
      'Débutant - Je découvre',
      'Intermédiaire - Je maîtrise les bases',
      'Avancé - Je suis expert',
      'Je n\'ai pas d\'expérience'
    ],
    correct: 0,
    explanation: 'Cette question permet d\'évaluer votre niveau de base.'
  },
  {
    id: 2,
    category: 'Général',
    question: 'Quel est votre objectif principal ?',
    options: [
      'Acquérir de nouvelles compétences',
      'Valider une certification',
      'Évoluer professionnellement',
      'Changer de carrière'
    ],
    correct: 0,
    explanation: 'Cette question aide à comprendre vos motivations.'
  },
  {
    id: 3,
    category: 'Général',
    question: 'Combien d\'heures par semaine pouvez-vous consacrer à la formation ?',
    options: [
      'Moins de 5 heures',
      '5 à 10 heures',
      '10 à 20 heures',
      'Plus de 20 heures'
    ],
    correct: 1,
    explanation: 'Cette question permet d\'adapter le rythme de formation.'
  },
  {
    id: 4,
    category: 'Général',
    question: 'Quel est votre niveau d\'anglais ?',
    options: [
      'Débutant',
      'Intermédiaire',
      'Avancé',
      'Bilingue'
    ],
    correct: 1,
    explanation: 'Cette question évalue votre niveau en anglais.'
  },
  {
    id: 5,
    category: 'Général',
    question: 'Avez-vous déjà suivi une formation en ligne ?',
    options: [
      'Oui, plusieurs',
      'Oui, une seule',
      'Non, jamais',
      'Je préfère le présentiel'
    ],
    correct: 2,
    explanation: 'Cette question permet de connaître votre expérience avec les formations.'
  },
  {
    id: 6,
    category: 'Général',
    question: 'Quel est votre niveau de confiance avec les outils numériques ?',
    options: [
      'Pas confiant',
      'Un peu confiant',
      'Confiant',
      'Très confiant'
    ],
    correct: 2,
    explanation: 'Cette question évalue votre aisance avec le numérique.'
  },
  {
    id: 7,
    category: 'Général',
    question: 'Quel type de formation préférez-vous ?',
    options: [
      'Théorique',
      'Pratique',
      'Mixte (théorie et pratique)',
      'Je n\'ai pas de préférence'
    ],
    correct: 2,
    explanation: 'Cette question permet d\'adapter le format de formation.'
  },
  {
    id: 8,
    category: 'Général',
    question: 'Quelle est votre disponibilité pour les sessions en présentiel ?',
    options: [
      'En semaine (matin)',
      'En semaine (après-midi)',
      'En soirée',
      'Le week-end'
    ],
    correct: 0,
    explanation: 'Cette question permet de planifier les sessions.'
  },
  {
    id: 9,
    category: 'Général',
    question: 'Avez-vous déjà utilisé des outils de collaboration en ligne ?',
    options: [
      'Oui, régulièrement',
      'Oui, occasionnellement',
      'Non, jamais',
      'Je ne sais pas'
    ],
    correct: 0,
    explanation: 'Cette question évalue votre expérience avec les outils collaboratifs.'
  },
  {
    id: 10,
    category: 'Général',
    question: 'Quel est votre objectif à long terme ?',
    options: [
      'Devenir expert dans mon domaine',
      'Créer mon entreprise',
      'Évoluer dans mon entreprise actuelle',
      'Changer de secteur d\'activité'
    ],
    correct: 0,
    explanation: 'Cette question permet de comprendre vos aspirations.'
  }
];

export default function DefaultTest({ formationId, onComplete, resetMode = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Timer
  useEffect(() => {
    if (!showResults && !resetMode) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, startTime, resetMode]);

  // Gestionnaire de réponse
  const handleAnswer = (optionIndex) => {
    const question = DEFAULT_QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: optionIndex });
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  // Passer à la question suivante
  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestion < DEFAULT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  // Terminer le test
  const finishTest = () => {
    const correct = DEFAULT_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = DEFAULT_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';
    
    const result = { 
      correct, 
      total, 
      percentage, 
      level, 
      answers, 
      timeSpent 
    };
    
    setShowResults(true);
    
    if (onComplete) {
      onComplete(result);
    }
  };

  // Recommencer le test
  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeSpent(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const question = DEFAULT_QUESTIONS[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  // Affichage des résultats
  if (showResults) {
    const correct = DEFAULT_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
    const total = DEFAULT_QUESTIONS.length;
    const percentage = Math.round((correct / total) * 100);
    const level = percentage >= 80 ? 'Avancé' : percentage >= 50 ? 'Intermédiaire' : 'Débutant';

    return (
      <TestResults
        score={correct}
        total={total}
        percentage={percentage}
        level={level}
        answers={answers}
        questions={DEFAULT_QUESTIONS}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onViewFormation={() => window.location.href = `/formations`}
      />
    );
  }

  // Affichage du test
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Test de Niveau</h3>
          <p className="text-xs text-gray-400">Question {currentQuestion + 1} sur {DEFAULT_QUESTIONS.length}</p>
        </div>
        <div className="text-sm text-gray-400">
          ⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
        </div>
      </div>

      <TestProgress 
        current={currentQuestion} 
        total={DEFAULT_QUESTIONS.length} 
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
        ✅ {Object.keys(answers).length} / {DEFAULT_QUESTIONS.length} questions répondues
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
          {currentQuestion === DEFAULT_QUESTIONS.length - 1 ? '📊 Voir les résultats' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}