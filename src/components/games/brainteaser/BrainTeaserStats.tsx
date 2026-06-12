"use client";

import React from 'react';

interface BrainTeaserStatsProps {
  attempts: number;
  answered: boolean;
  isCorrect: boolean;
  score: number;
}

export default function BrainTeaserStats({
  attempts,
  answered,
  isCorrect,
  score,
}: BrainTeaserStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Attempts */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm font-medium mb-2">Attempts</p>
        <p className="text-3xl font-bold text-blue-400">{attempts}</p>
      </div>

      {/* Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm font-medium mb-2">Status</p>
        <p className={`text-lg font-bold ${
          isCorrect ? 'text-green-400' : answered ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {isCorrect ? '✓ Correct' : answered ? '✗ Answered' : 'Answering'}
        </p>
      </div>

      {/* Question Score */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm font-medium mb-2">Points</p>
        <p className="text-3xl font-bold text-green-400">+{score}</p>
      </div>
    </div>
  );
}