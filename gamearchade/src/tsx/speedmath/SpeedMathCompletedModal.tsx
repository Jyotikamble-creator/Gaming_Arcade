// A modal component to display the final results of the Speed Math game mode.
interface SpeedMathCompletedModalProps {
  score: number;
  problemsSolved: number;
  totalProblems: number;
  bestStreak: number;
  difficulty: string | null;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const SpeedMathCompletedModal = ({
  score,
  problemsSolved,
  totalProblems,
  bestStreak,
  difficulty,
  onRestart,
  onBackToMenu
}: SpeedMathCompletedModalProps): JSX.Element => {
  const accuracy = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0;

  // Function to get the difficulty badge
  const getDifficultyBadge = (): { emoji: string; label: string; color: string } => {
    switch (difficulty) {
      case 'easy': return { emoji: '🟢', label: 'Easy', color: 'text-green-400' };
      case 'medium': return { emoji: '🟡', label: 'Medium', color: 'text-yellow-400' };
      case 'hard': return { emoji: '🔴', label: 'Hard', color: 'text-red-400' };
      default: return { emoji: '⚪', label: 'Unknown', color: 'text-gray-400' };
    }
  };

  // Get the difficulty badge
  const badge = getDifficultyBadge();

  // Render the modal
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⏱️</div>
          <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
          <p className="text-gray-400">Great job solving problems!</p>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-center">
          <div className="text-gray-200 text-sm font-medium mb-1">FINAL SCORE</div>
          <div className="text-5xl font-bold text-white">{score}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Problems Solved</div>
            <div className="text-2xl font-bold text-white">{problemsSolved}</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Total Attempts</div>
            <div className="text-2xl font-bold text-white">{totalProblems}</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Best Streak</div>
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              {bestStreak > 0 && <span className="text-xl">🔥</span>}
              {bestStreak}
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="bg-gray-700/50 rounded-lg p-3 mb-6 text-center">
          <span className="text-gray-400 text-sm">Difficulty: </span>
          <span className={`font-bold ${badge.color}`}>
            {badge.emoji} {badge.label}
          </span>
        </div>

        {/* Performance Message */}
        <div className="text-center mb-6">
          {accuracy >= 90 && (
            <p className="text-green-400 font-semibold">🌟 Outstanding! You're a math wizard!</p>
          )}
          {accuracy >= 70 && accuracy < 90 && (
            <p className="text-blue-400 font-semibold">👍 Great work! Keep practicing!</p>
          )}
          {accuracy >= 50 && accuracy < 70 && (
            <p className="text-yellow-400 font-semibold">💪 Good effort! You're improving!</p>
          )}
          {accuracy < 50 && (
            <p className="text-orange-400 font-semibold">🎯 Keep practicing, you'll get faster!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Play Again 🎮
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            ← Back to Difficulty Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeedMathCompletedModal;