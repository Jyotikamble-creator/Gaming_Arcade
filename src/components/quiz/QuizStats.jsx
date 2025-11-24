import React from 'react';

const QuizStats = ({ current, total, score, progress }) => {
  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">QUESTION</span>
        <div className="text-2xl font-bold text-white">{current}/{total}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">SCORE</span>
        <div className="text-2xl font-bold text-white">{score}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">PROGRESS</span>
        <div className="text-2xl font-bold text-white">{progress}%</div>
      </div>
    </div>
  );
};

export default QuizStats;