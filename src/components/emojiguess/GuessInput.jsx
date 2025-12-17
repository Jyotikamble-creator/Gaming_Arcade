// A React component that renders an input field for the user to enter their guess in the Emoji Guess game.
// The component takes in the guess, setGuess, onSubmit, onKeyPress, and disabled props.
const GuessInput = ({ guess, setGuess, onSubmit, onKeyPress, disabled }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
      <div className="max-w-md mx-auto">
        <label htmlFor="guess" className="block text-sm font-medium text-subtle-text mb-3 text-center">
          Your Guess
        </label>
        <div className="relative">
          <input
            id="guess"
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={disabled}
            placeholder="Type your answer here..."
            className="w-full pl-4 pr-20 py-3 bg-gray-700 border border-gray-600 rounded-lg text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={50}
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !guess.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-blue hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
          >
            Guess
          </button>
        </div>
        <p className="text-xs text-subtle-text mt-2 text-center">
          Press Enter or click Guess to submit
        </p>
      </div>
    </div>
  );
};

export default GuessInput;