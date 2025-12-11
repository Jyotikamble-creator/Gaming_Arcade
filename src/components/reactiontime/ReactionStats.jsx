import React from 'react';

export default function ReactionStats({ currentRound, totalRounds, reactionTimes, bestTime }) {
  const avgTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-indigo-500/30 shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-400">
            {currentRound + 1}/{totalRounds}
          </div>
          <div className="text-gray-400 text-sm mt-1">Round</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {avgTime}ms
          </div>
          <div className="text-gray-400 text-sm mt-1">Average</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">
            {bestTime !== null ? `${bestTime}ms` : '-'}
          </div>
          <div className="text-gray-400 text-sm mt-1">Best Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {reactionTimes.length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Completed</div>
        </div>
      </div>
    </div>
  );
}
