import React from 'react';

interface SpeedMathCompletedModalProps {
  score: number;
  problemsSolved: number;
  totalProblems: number;
  bestStreak: number;
  difficulty: string | null;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const SpeedMathCompletedModal: React.FC<SpeedMathCompletedModalProps> = ({
  score,
  problemsSolved,
  totalProblems,
  bestStreak,
  difficulty,
  onRestart,
  onBackToMenu
}) => {
  const getScoreMessage = () => {
    if (score >= 250) return { emoji: '🌟', message: 'LEGENDARY PERFORMANCE!', color: 'text-yellow-400' };
    if (score >= 150) return { emoji: '👑', message: 'OUTSTANDING!', color: 'text-purple-400' };
    if (score >= 100) return { emoji: '🎉', message: 'GREAT JOB!', color: 'text-green-400' };
    if (score >= 50) return { emoji: '👍', message: 'NICE WORK!', color: 'text-blue-400' };
    return { emoji: '💪', message: 'GOOD START!', color: 'text-orange-400' };
  };

  const scoreMessage = getScoreMessage();
  const accuracy = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500/50 shadow-2xl animate-in">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{scoreMessage.emoji}</div>
          <h2 className={`text-2xl font-bold ${scoreMessage.color} mb-2`}>
            {scoreMessage.message}
          </h2>
          <p className="text-gray-400">Time's Up! Round Complete!</p>
        </div>

        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-center animate-pulse">
          <div className="text-gray-200 text-sm font-medium mb-1">TOTAL SCORE</div>
          <div className="text-6xl font-bold text-white">{score}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-600">
            <div className="text-gray-400 text-xs font-semibold mb-1">ACCURACY</div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-xs text-gray-500 mt-1">{problemsSolved} / {totalProblems}</div>
          </div>

          <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-600">
            <div className="text-gray-400 text-xs font-semibold mb-1">BEST STREAK</div>
            <div className="text-2xl font-bold text-purple-400">{bestStreak}</div>
            <div className="text-xs text-gray-500 mt-1">Difficulty: {difficulty || 'medium'}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 text-lg"
          >
            🎮 Play Again
          </button>
          
          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-700/50 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeedMathCompletedModal;