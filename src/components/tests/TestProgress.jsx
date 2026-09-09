// frontend/src/components/tests/TestProgress.jsx
import React from 'react';

export default function TestProgress({ current, total, answered }) {
  const progress = (current / total) * 100;
  const answeredCount = Object.keys(answered).length;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Question {current + 1}/{total}</span>
        <span>✅ {answeredCount}/{total} répondues</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}