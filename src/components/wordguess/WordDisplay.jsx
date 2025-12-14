// This component displays the word to be guessed, showing letters that have been chosen and blanks for those that haven't.
const WordDisplay = ({ word, chosenLetters }) => {
  // Render the word display with chosen letters and blanks
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from(word).map((letter, index) => (

        <div
          key={index}
          className="w-12 h-12 bg-gray-700 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
          aria-label={chosenLetters.includes(letter) ? `Letter ${letter}` : 'Blank letter'}
        >
          {chosenLetters.includes(letter) ? letter : '_'}
        </div>
      ))}
    </div>
  );
};

export default WordDisplay;