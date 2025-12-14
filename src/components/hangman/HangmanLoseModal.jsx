// A modal component displayed when the player loses the Hangman game, showing the correct word, final score, and an option to try again.
// This component is used in the Hangman game.
const HangmanLoseModal = ({
  word,
  score,
  wordsCompleted,
  onTryAgain
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-red-500/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over!</h2>
          <p className="text-gray-400">You ran out of attempts...</p>
        </div>

        {/* Word Display */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 mb-6 text-center">
          <div className="text-gray-200 text-sm font-medium mb-1">THE WORD WAS</div>
          <div className="text-4xl font-bold text-white uppercase tracking-wider">{word}</div>
        </div>

        {/* Final Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Final Score</div>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>

          {/* Words Completed */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Words Completed</div>
            <div className="text-2xl font-bold text-white">{wordsCompleted}</div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="text-center mb-6">
          <p className="text-yellow-400 font-semibold">
            {wordsCompleted > 0
              ? `🎯 Great job! You completed ${wordsCompleted} word${wordsCompleted > 1 ? 's' : ''}!`
              : '💪 Keep practicing, you\'ll get better!'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onTryAgain}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
        >
          Try Again 🔄
        </button>
      </div>
    </div>
  );
};

export default HangmanLoseModal;
