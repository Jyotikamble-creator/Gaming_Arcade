import React from 'react';

const SpeedMathStats = ({ score, problemsSolved, streak, bestStreak }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">SCORE</div>
        <div className="text-3xl font-bold text-white">{score}</div>
      </div>
      
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">SOLVED</div>
        <div className="text-3xl font-bold text-white">{problemsSolved}</div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">STREAK</div>
        <div className="text-3xl font-bold text-white flex items-center justify-center gap-1">
          {streak > 0 && <span className="text-2xl">🔥</span>}
          {streak}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">BEST</div>
        <div className="text-3xl font-bold text-white flex items-center justify-center gap-1">
          {bestStreak > 0 && <span className="text-2xl">⭐</span>}
          {bestStreak}
        </div>
      </div>
    </div>
  );
};

export default SpeedMathStats;
