'use client';

import React from 'react';

interface SpeedMathStatsProps {
  attempts: number;
  answered: boolean;
  isCorrect: boolean;
  score: number;
}

const SpeedMathStats: React.FC<SpeedMathStatsProps> = ({
  attempts,
  answered,
  isCorrect,
  score
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Attempts */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-sm font-semibold mb-2">ATTEMPTS</p>
        <p className="text-3xl font-bold text-yellow-400">{attempts}</p>
      </div>

      {/* Status */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-sm font-semibold mb-2">STATUS</p>
        <p className={`text-3xl font-bold ${
          isCorrect ? 'text-green-400' : answered ? 'text-red-400' : 'text-blue-400'
        }`}>
          {isCorrect ? '✓' : answered ? '✕' : '?'}
        </p>
      </div>

      {/* Points */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-sm font-semibold mb-2">POINTS</p>
        <p className="text-3xl font-bold text-green-400">{isCorrect ? score : '-'}</p>
      </div>
    </div>
  );
};

export default SpeedMathStats;