// This component provides game control buttons for the Word Guess game mode, including options to remove the last letter, use a hint, make a guess, and start a new game.
const GameControls = ({
  onRemoveLast,
  onUseHint,
  onGuess,
  onRestart,
  chosenLetters,
  hints,
  disabled
}) => {
  // Render the game control buttons
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <button
        onClick={onRemoveLast}
        disabled={!chosenLetters.length}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
      >
        Remove Last
      </button>

      <button
        onClick={onUseHint}
        disabled={hints <= 0 || disabled}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
      >
        Hint ({hints})
      </button>

      <button
        onClick={onGuess}
        disabled={!chosenLetters.length || disabled}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
      >
        Guess
      </button>

      <button
        onClick={onRestart}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        New Word
      </button>
    </div>
  );
};

export default GameControls;