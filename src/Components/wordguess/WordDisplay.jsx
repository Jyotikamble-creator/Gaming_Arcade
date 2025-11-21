import React from 'react';

const WordDisplay = ({ word, chosenLetters }) => {
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