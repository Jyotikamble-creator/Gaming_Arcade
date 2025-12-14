// A virtual keyboard component for the Hangman game.
// This component allows players to select letters to guess the word.
const Keyboard = ({ guessedLetters, onGuess, word }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];
  // Function to get the button style based on the letter
  const getButtonStyle = (letter) => {
    if (!guessedLetters.includes(letter)) {
      return 'bg-gray-700 hover:bg-gray-600 text-white';
    }

    if (word.includes(letter)) {
      return 'bg-green-600 text-white cursor-not-allowed';
    }

    return 'bg-red-600 text-white cursor-not-allowed';
  };

  // Render the virtual keyboard
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">Select a Letter</h3>
      {/* Keyboard buttons */}
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => onGuess(letter)}
                disabled={guessedLetters.includes(letter)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-lg transition-all duration-200 ${getButtonStyle(letter)}`}
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          <span className="text-green-400">Green</span> = Correct • <span className="text-red-400">Red</span> = Wrong
        </p>
      </div>
    </div>
  );
};

export default Keyboard;
