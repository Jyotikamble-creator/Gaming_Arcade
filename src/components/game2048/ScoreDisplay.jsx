import React from 'react';
import { Trophy, Target } from 'lucide-react';

const ScoreDisplay = ({ score, bestScore }) => {
  return (
    <div className="flex justify-center gap-6 mb-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">SCORE</span>
        </div>
        <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium text-gray-300">BEST</span>
        </div>
        <div className="text-2xl font-bold text-white">{bestScore.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ScoreDisplay;