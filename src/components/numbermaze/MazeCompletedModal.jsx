import React from 'react';

const MazeCompletedModal = ({ moves, time, score, targetNumber, efficiency, onPlayAgain }) => {
  const getRating = () => {
    if (efficiency >= 90) return { text: 'Master Mathematician', color: 'text-purple-400', emoji: '🏆' };
    if (efficiency >= 75) return { text: 'Expert Navigator', color: 'text-blue-400', emoji: '⭐' };
    if (efficiency >= 60) return { text: 'Skilled Solver', color: 'text-green-400', emoji: '🎯' };
    if (efficiency >= 45) return { text: 'Apprentice', color: 'text-yellow-400', emoji: '📈' };
    return { text: 'Beginner', color: 'text-gray-400', emoji: '🌱' };
  };

  const rating = getRating();
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Maze Completed!</h2>
          <p className="text-gray-300">You reached the target number!</p>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Target Number:</span>
            <span className="text-blue-400 font-semibold">{targetNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Moves Taken:</span>
            <span className="text-white font-semibold">{moves}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Time:</span>
            <span className="text-white font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Efficiency:</span>
            <span className="text-purple-400 font-semibold">{Math.round(efficiency)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Final Score:</span>
            <span className="text-green-400 font-bold text-xl">{score}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="text-center mb-6">
          <div className={`text-2xl font-bold ${rating.color} mb-2`}>
            {rating.emoji} {rating.text}
          </div>
          <div className="text-sm text-gray-400">
            {efficiency >= 90 ? 'Outstanding performance!' :
             efficiency >= 75 ? 'Great job navigating!' :
             efficiency >= 60 ? 'Well done!' :
             efficiency >= 45 ? 'Keep practicing!' :
             'Try to be more efficient next time!'}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">💡 Tips for Better Scores:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Plan your path to avoid unnecessary detours</li>
            <li>• Watch the difference counter closely</li>
            <li>• Positive numbers help, negative numbers hurt</li>
            <li>• Efficiency rewards smart navigation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
          >
            Play Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
          >
            Back to Games
          </button>
        </div>
      </div>
    </div>
  );
};

export default MazeCompletedModal;