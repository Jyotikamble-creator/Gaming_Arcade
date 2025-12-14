// A modal component displayed when the player wins a Hangman game, showing stats and options.
// This component is used in the Hangman game.
const HangmanWinModal = ({
  word,
  wrongGuesses,
  maxGuesses,
  score,
  wordsCompleted,
  onNextWord,
  onBackToMenu
}) => {
  const accuracy = maxGuesses > 0 ? Math.round(((maxGuesses - wrongGuesses) / maxGuesses) * 100) : 0;
  // Return the HangmanWinModal component
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-green-500/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-400 mb-2">You Won!</h2>
          <p className="text-gray-400">Congratulations! You guessed the word!</p>
        </div>

        {/* Word Display */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-6 text-center">
          <div className="text-gray-200 text-sm font-medium mb-1">THE WORD WAS</div>
          <div className="text-4xl font-bold text-white uppercase tracking-wider">{word}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Total Score</div>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>

          {/* Words Completed */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Words Completed</div>
            <div className="text-2xl font-bold text-white">{wordsCompleted}</div>
          </div>

          {/* Wrong Guesses */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Wrong Guesses</div>
            <div className="text-2xl font-bold text-white">{wrongGuesses}/{maxGuesses}</div>
          </div>

          {/* Accuracy */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="text-center mb-6">
          {wrongGuesses === 0 && (
            <p className="text-green-400 font-semibold">🌟 Perfect! No mistakes!</p>
          )}
          {wrongGuesses > 0 && wrongGuesses <= 2 && (
            <p className="text-blue-400 font-semibold">👍 Excellent job!</p>
          )}
          {wrongGuesses > 2 && wrongGuesses < maxGuesses && (
            <p className="text-yellow-400 font-semibold">💪 Good effort!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNextWord}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Next Word ➡️
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            ← Back to Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default HangmanWinModal;
