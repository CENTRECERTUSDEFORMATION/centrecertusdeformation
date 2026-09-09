// frontend/src/components/tests/TestResults.jsx
import React from 'react';

export default function TestResults({ 
  score, 
  total, 
  percentage, 
  level, 
  answers, 
  questions, 
  timeSpent, 
  onRetry, 
  onViewFormation 
}) {
  const levelColors = {
    'Avancé': 'text-green-600 bg-green-50 border-green-200',
    'Intermédiaire': 'text-orange-600 bg-orange-50 border-orange-200',
    'Débutant': 'text-blue-600 bg-blue-50 border-blue-200'
  };

  const levelEmojis = {
    'Avancé': '🏆',
    'Intermédiaire': '📊',
    'Débutant': '📚'
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 Résultats du Test</h2>
        <p className="text-gray-500">Évaluation des compétences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">✅ Correctes</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{total - score}</div>
          <div className="text-sm text-gray-600">❌ Incorrectes</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-600">{total - Object.keys(answers).length}</div>
          <div className="text-sm text-gray-600">⏭️ Non répondues</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
          <div className="text-sm text-gray-600">🎯 Taux de réussite</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-6">
        ⏱️ Temps total : {formatTime(timeSpent)}
      </div>

      <div className={`rounded-xl p-6 mb-8 border ${levelColors[level] || 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl ${
            level === 'Avancé' ? 'bg-green-500' :
            level === 'Intermédiaire' ? 'bg-orange-500' :
            'bg-blue-500'
          }`}>
            {levelEmojis[level] || '📚'}
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${levelColors[level] || 'text-gray-700'}`}>
              Niveau {level}
            </h3>
            <p className="text-gray-700 mt-1">
              {level === 'Avancé' ? 'Félicitations ! Vous maîtrisez parfaitement le sujet.' :
               level === 'Intermédiaire' ? 'Bonnes bases ! Continuez à progresser.' :
               'Pas de panique ! Commencez par les bases.'}
            </p>
            <button
              onClick={onViewFormation}
              className={`inline-block mt-3 px-6 py-2 rounded-lg font-semibold text-white transition ${
                level === 'Avancé' ? 'bg-green-600 hover:bg-green-700' :
                level === 'Intermédiaire' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              🎓 Voir la formation
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
        >
          🔄 Recommencer le test
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition shadow-md hover:shadow-lg"
        >
          🖨️ Imprimer les résultats
        </button>
      </div>
    </div>
  );
}