import React from 'react';

const SimonSaysStats = ({ round, sequenceLength, gameStatus }) => {
  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">ROUND</span>
        <div className="text-2xl font-bold text-white">{round}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">SEQUENCE LENGTH</span>
        <div className="text-2xl font-bold text-white">{sequenceLength}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">STATUS</span>
        <div className="text-lg font-bold text-white">{gameStatus}</div>
      </div>
    </div>
  );
};

export default SimonSaysStats;