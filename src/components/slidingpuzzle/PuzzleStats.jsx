import React from 'react';

export default function PuzzleStats({ moves, timeElapsed, gameStarted, gameCompleted }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEfficiency = () => {
    if (moves === 0) return 0;
    // Theoretical minimum moves for 15-puzzle is around 80, but varies
    const theoreticalMin = 80;
    const efficiency = Math.max(0, (theoreticalMin / moves) * 100);
    return Math.min(100, efficiency);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-subtle-text text-sm mb-1">Moves</p>
          <p className="text-2xl font-bold text-blue-400">{moves}</p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Time</p>
          <p className="text-2xl font-bold text-green-400">{formatTime(timeElapsed)}</p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Status</p>
          <p className={`text-lg font-semibold ${
            gameCompleted ? 'text-green-400' :
            gameStarted ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {gameCompleted ? 'Solved!' :
             gameStarted ? 'Playing' : 'Ready'}
          </p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Efficiency</p>
          <p className="text-2xl font-bold text-purple-400">
            {gameStarted || gameCompleted ? `${Math.round(getEfficiency())}%` : '--'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      {gameStarted && !gameCompleted && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-subtle-text mb-1">
            <span>Progress</span>
            <span>{moves} moves</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (moves / 200) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
