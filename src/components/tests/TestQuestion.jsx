// frontend/src/components/tests/TestQuestion.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function TestQuestion({ 
  question, 
  selectedOption, 
  onSelect, 
  isAnswered,
  showExplanation 
}) {
  const getOptionStyle = (idx) => {
    if (!isAnswered) {
      return selectedOption === idx 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50';
    }
    
    if (idx === question.correct) {
      return 'border-green-500 bg-green-50';
    }
    
    if (selectedOption === idx && idx !== question.correct) {
      return 'border-red-500 bg-red-50';
    }
    
    return 'border-gray-200 opacity-60';
  };

  const getOptionIcon = (idx) => {
    if (!isAnswered) {
      return selectedOption === idx 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 text-gray-600';
    }
    
    if (idx === question.correct) {
      return 'bg-green-500 text-white';
    }
    
    if (selectedOption === idx && idx !== question.correct) {
      return 'bg-red-500 text-white';
    }
    
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
          📂 {question.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-800 mt-2">
          {question.question}
        </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !isAnswered && onSelect(idx)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(idx)} ${
              isAnswered ? 'cursor-default' : 'cursor-pointer'
            }`}
            disabled={isAnswered}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getOptionIcon(idx)}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{option}</span>
              {isAnswered && idx === question.correct && (
                <span className="text-green-500 text-xl">✅</span>
              )}
              {isAnswered && selectedOption === idx && idx !== question.correct && (
                <span className="text-red-500 text-xl">❌</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {showExplanation && question.explanation && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <p className="text-sm text-gray-700">
            💡 <span className="font-semibold">Explication :</span> {question.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}