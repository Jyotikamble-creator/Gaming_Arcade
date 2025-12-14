// Component for user input and action buttons in the coding puzzle

export default function PuzzleInput({
  userAnswer,
  setUserAnswer,
  onSubmit,
  onSkip,
  onToggleHint,
  showHint,
  feedback
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  // Render the input and buttons
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
      <div className="mb-4">
        <label className="block text-white font-semibold mb-3 text-lg">
          Your Answer:
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer here..."
          className="w-full bg-gray-900/70 border-2 border-purple-500/50 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
          autoFocus
        />
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`mb-4 px-6 py-3 rounded-xl font-semibold text-center ${feedback.type === 'success'
            ? 'bg-green-600/30 text-green-300 border-2 border-green-500/50'
            : 'bg-red-600/30 text-red-300 border-2 border-red-500/50'
          }`}>
          {feedback.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={onSubmit}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={!userAnswer.trim()}
        >
          Submit
        </button>

        <button
          onClick={onToggleHint}
          className={`${showHint
              ? 'bg-gradient-to-r from-yellow-700 to-orange-700 hover:from-yellow-800 hover:to-orange-800'
              : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
            } text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105`}
        >
          {showHint ? '🔒 Hide Hint' : '💡 Show Hint'}
        </button>

        <button
          onClick={onSkip}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
        >
          Skip ⏭️
        </button>
      </div>

      <div className="mt-4 text-center text-gray-400 text-sm">
        Press Enter to submit • Using hints reduces bonus points
      </div>
    </div>
  );
}
