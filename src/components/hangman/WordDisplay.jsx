import React from 'react';

const WordDisplay = ({ word, guessedLetters }) => {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">Guess the Word</h3>
      
      <div className="flex flex-wrap justify-center gap-2">
        {word.split('').map((letter, index) => (
          <div
            key={index}
            className="w-12 h-16 bg-gray-700 border-2 border-indigo-500/50 rounded-lg flex items-center justify-center"
          >
            <span className="text-3xl font-bold text-white">
              {guessedLetters.includes(letter) ? letter.toUpperCase() : ''}
            </span>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">
          {word.length} {word.length === 1 ? 'letter' : 'letters'}
        </p>
      </div>
    </div>
  );
};

export default WordDisplay;
