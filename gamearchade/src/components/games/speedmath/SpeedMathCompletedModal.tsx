import React from 'react';

interface SpeedMathCompletedModalProps {
  score: number;
  onClose: () => void;
}

const SpeedMathCompletedModal: React.FC<SpeedMathCompletedModalProps> = ({
  score,
  onClose
}) => {
  const getScoreMessage = () => {
    if (score >= 250) return { emoji: '🌟', message: 'LEGENDARY PERFORMANCE!', color: 'text-yellow-400' };
    if (score >= 150) return { emoji: '👑', message: 'OUTSTANDING!', color: 'text-purple-400' };
    if (score >= 100) return { emoji: '🎉', message: 'GREAT JOB!', color: 'text-green-400' };
    if (score >= 50) return { emoji: '👍', message: 'NICE WORK!', color: 'text-blue-400' };
    return { emoji: '💪', message: 'GOOD START!', color: 'text-orange-400' };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500/50 shadow-2xl animate-in">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{scoreMessage.emoji}</div>
          <h2 className={`text-4xl font-bold ${scoreMessage.color} mb-2`}>
            {scoreMessage.message}
          </h2>
          <p className="text-gray-400">Round Complete!</p>
        </div>

        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-center">
          <div className="text-gray-200 text-sm font-medium mb-2">TOTAL SCORE</div>
          <div className="text-6xl font-bold text-white">{score}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-600">
            <div className="text-gray-400 text-xs font-semibold mb-2">PROBLEMS</div>
            <div className="text-3xl font-bold text-white">5/5</div>
          </div>

          <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-600">
            <div className="text-gray-400 text-xs font-semibold mb-2">COMPLETED</div>
            <div className="text-3xl font-bold text-green-400">✓</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-300 mb-2">
            You've completed all 5 math problems!
          </p>
          <p className="text-gray-400 text-sm">
            Your score has been added to the leaderboard.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 text-lg"
          >
            ← Back to Difficulty Selection
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-700/50 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeedMathCompletedModal;