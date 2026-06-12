'use client';

import React from 'react';

interface SpeedMathStatsProps {
  score: number;
  problemsSolved: number;
  streak: number;
  bestStreak: number;
}

const SpeedMathStats: React.FC<SpeedMathStatsProps> = ({
  score,
  problemsSolved,
  streak,
  bestStreak
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Solved */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-xs font-semibold mb-2">SOLVED</p>
        <p className="text-3xl font-bold text-yellow-400">{problemsSolved}</p>
      </div>

      {/* Streak */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-xs font-semibold mb-2">STREAK</p>
        <p className="text-3xl font-bold text-blue-400">
          {streak} <span className="text-sm font-normal text-gray-500">/ {bestStreak}</span>
        </p>
      </div>

      {/* Points */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
        <p className="text-gray-400 text-xs font-semibold mb-2">POINTS</p>
        <p className="text-3xl font-bold text-green-400">{score}</p>
      </div>
    </div>
  );
};

export default SpeedMathStats;