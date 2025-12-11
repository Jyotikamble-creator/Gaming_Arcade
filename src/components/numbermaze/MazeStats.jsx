import React from 'react';

const MazeStats = ({ currentSum, targetNumber, moves, time, efficiency, gameStarted }) => {
  const difference = targetNumber - currentSum;
  const isClose = Math.abs(difference) <= 5;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {/* Current Sum */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">{currentSum}</div>
          <div className="text-sm text-gray-300">Current Sum</div>
        </div>

        {/* Target */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">{targetNumber}</div>
          <div className="text-sm text-gray-300">Target</div>
        </div>

        {/* Difference */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className={`text-2xl font-bold mb-1 ${isClose ? 'text-green-400' : difference > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {difference > 0 ? `+${difference}` : difference}
          </div>
          <div className="text-sm text-gray-300">Difference</div>
        </div>

        {/* Efficiency */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400 mb-1">{Math.round(efficiency)}%</div>
          <div className="text-sm text-gray-300">Efficiency</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Moves: {moves}</span>
          <span>Time: {time}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (Math.abs(currentSum) / Math.max(1, Math.abs(targetNumber))) * 100)}%` }}
          ></div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-1">
          Progress toward target
        </div>
      </div>

      {/* Status Message */}
      {gameStarted && (
        <div className="mt-4 text-center">
          {difference === 0 ? (
            <div className="text-green-400 font-semibold">🎉 Target reached!</div>
          ) : isClose ? (
            <div className="text-yellow-400 font-semibold">🔥 So close! Keep going!</div>
          ) : difference > 0 ? (
            <div className="text-blue-400">Need {difference} more</div>
          ) : (
            <div className="text-red-400">Over by {Math.abs(difference)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MazeStats;