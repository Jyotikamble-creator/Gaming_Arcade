import React from 'react';

export default function BrainTeaserCompletedModal({ 
  score, 
  puzzlesSolved, 
  bestStreak,
  onPlayAgain, 
  onBackToMenu 
}) {
  const getPerformanceRating = () => {
    if (puzzlesSolved >= 20) return { text: '🏆 Genius!', color: 'text-yellow-300' };
    if (puzzlesSolved >= 15) return { text: '⭐ Excellent!', color: 'text-green-300' };
    if (puzzlesSolved >= 10) return { text: '👍 Great!', color: 'text-blue-300' };
    if (puzzlesSolved >= 5) return { text: '👌 Good!', color: 'text-purple-300' };
    return { text: '💪 Keep Practicing!', color: 'text-orange-300' };
  };

  const performance = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 via-purple-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border-2 border-purple-500/50 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-4xl font-bold text-white mb-2">Challenge Complete!</h2>
          <p className={`text-2xl font-bold ${performance.color}`}>
            {performance.text}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Final Score:</span>
            <span className="text-3xl font-bold text-purple-400">{score}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Puzzles Solved:</span>
            <span className="text-2xl font-bold text-blue-400">{puzzlesSolved}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Best Streak:</span>
            <span className="text-2xl font-bold text-orange-400">{bestStreak}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-semibold">Avg Points/Puzzle:</span>
            <span className="text-2xl font-bold text-green-400">
              {puzzlesSolved > 0 ? Math.round(score / puzzlesSolved) : 0}
            </span>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-purple-600/20 rounded-xl p-4 mb-6 border border-purple-500/30">
          <p className="text-center text-purple-200 font-semibold">
            {puzzlesSolved >= 20 ? '🎯 Incredible visual reasoning skills!' :
             puzzlesSolved >= 15 ? '🌟 Outstanding pattern recognition!' :
             puzzlesSolved >= 10 ? '👏 Great problem-solving ability!' :
             puzzlesSolved >= 5 ? '📈 Good start! Practice makes perfect!' :
             '💡 Keep challenging your brain to improve!'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Play Again
          </button>
          
          <button
            onClick={onBackToMenu}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
