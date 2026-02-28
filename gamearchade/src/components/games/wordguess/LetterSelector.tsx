// LetterSelector component for selecting letters
import React from 'react';
import { LetterSelectorProps } from '@/types/games/word-guess';
import { WORD_GUESS_CONSTANTS } from '@/types/games/word-guess';

export default function LetterSelector({
  chosenLetters,
  onSelectLetter,
  disabled
}: LetterSelectorProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        Select Letters
      </h3>
      
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2 max-w-4xl mx-auto">
        {WORD_GUESS_CONSTANTS.ALPHABET.map((letter) => {
          const isChosen = chosenLetters.includes(letter);
          
          return (
            <button
              key={letter}
              onClick={() => !isChosen && !disabled && onSelectLetter(letter)}
              disabled={isChosen || disabled}
              className={`
                w-10 h-10 sm:w-12 sm:h-12 font-bold text-lg rounded-lg border-2 
                transition-all duration-200 transform shadow-sm
                ${isChosen 
                  ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed opacity-60' 
                  : disabled
                    ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 hover:scale-110 hover:shadow-lg cursor-pointer'
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Letter Selection Info */}
      <div className="mt-4 text-center space-y-2">
        <div className="text-gray-400 text-sm">
          {chosenLetters.length} of {WORD_GUESS_CONSTANTS.ALPHABET.length} letters selected
        </div>
        
        {chosenLetters.length > 0 && (
          <div className="text-gray-300 text-sm">
            <span className="font-medium">Selected:</span> {chosenLetters.join(', ')}
          </div>
        )}
        
        {disabled && (
          <div className="text-orange-400 text-sm font-medium">
            🎮 Game ended - Start a new game to continue
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div
            className="bg-linear-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${(chosenLetters.length / WORD_GUESS_CONSTANTS.ALPHABET.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}