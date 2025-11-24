import React from 'react';

const LetterSelector = ({ chosenLetters, onSelectLetter, disabled }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 mb-6 max-w-md mx-auto">
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => onSelectLetter(letter)}
          disabled={chosenLetters.includes(letter) || disabled}
          className={`
            w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200
            ${chosenLetters.includes(letter)
              ? 'bg-blue-600 text-white cursor-not-allowed opacity-50'
              : disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
            }
          `}
          aria-label={`Select letter ${letter}`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default LetterSelector;