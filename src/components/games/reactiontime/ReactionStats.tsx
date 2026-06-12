import React from 'react';

interface Props {
  currentRound: number;
  totalRounds: number;
  reactionTimes: number[];
  bestTime: number | null;
  difficulty?: string;
}

export default function ReactionStats({ currentRound, totalRounds, reactionTimes, bestTime, difficulty }: Props) {
  const avgTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const progressPercent = (currentRound / totalRounds) * 100;

  return (
    <div className="bg-gradient-to-r from-gray-800/90 via-indigo-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-indigo-500/30 shadow-2xl">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-300">Progress</span>
          <span className="text-sm text-indigo-400">{currentRound}/{totalRounds}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
          <div className="text-4xl font-bold text-indigo-400">{currentRound + 1}</div>
          <div className="text-gray-400 text-xs mt-1">Round</div>
        </div>

        <div className="text-center p-3 bg-blue-600/10 rounded-lg border border-blue-500/20">
          <div className="text-4xl font-bold text-blue-400">{avgTime}</div>
          <div className="text-gray-400 text-xs mt-1">Average (ms)</div>
        </div>

        <div className="text-center p-3 bg-green-600/10 rounded-lg border border-green-500/20">
          <div className="text-4xl font-bold text-green-400">{bestTime !== null ? `${bestTime}` : '-'}</div>
          <div className="text-gray-400 text-xs mt-1">Best (ms)</div>
        </div>

        <div className="text-center p-3 bg-purple-600/10 rounded-lg border border-purple-500/20">
          <div className="text-4xl font-bold text-purple-400">{totalRounds - currentRound}</div>
          <div className="text-gray-400 text-xs mt-1">Remaining</div>
        </div>
      </div>

      {difficulty && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <span className="text-xs text-gray-400">Difficulty: </span>
          <span className="text-sm font-semibold text-indigo-300">{difficulty}</span>
        </div>
      )}
    </div>
  );
}
