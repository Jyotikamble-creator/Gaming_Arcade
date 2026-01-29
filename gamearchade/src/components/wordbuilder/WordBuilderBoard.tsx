// WordBuilderBoard component for displaying letters and current word
import React from 'react';
import { WordBuilderBoardProps } from '@/types/games/word-builder';

export default function WordBuilderBoard({
  availableLetters,
  currentWord,
  foundWords,
  onLetterClick,
  onRemoveLetter
}: WordBuilderBoardProps): JSX.Element {
  return (
    <div className="space-y-8">
      {/* Current Word Display */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">Current Word</h3>
        
        <div className="flex justify-center items-center min-h-[80px]">
          {currentWord.length === 0 ? (
            <div className="text-gray-400 text-lg">Click letters below to build a word</div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center">
              {currentWord.map((letter, index) => (
                <button
                  key={`${letter.id}-${index}`}
                  onClick={() => onRemoveLetter(index)}
                  className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-lg border-2 border-blue-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {letter.letter}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {currentWord.length > 0 && (
          <div className="text-center mt-4">
            <div className="text-gray-300 text-lg font-semibold">
              {currentWord.map(l => l.letter).join('')}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Click a letter to remove it
            </div>
          </div>
        )}
      </div>

      {/* Available Letters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">Available Letters</h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-md mx-auto">
          {availableLetters.map((letter) => (
            <button
              key={letter.id}
              onClick={() => !letter.used && onLetterClick(letter.id)}
              disabled={letter.used}
              className={`
                w-14 h-14 font-bold text-xl rounded-lg border-2 transition-all duration-200 transform shadow-lg
                ${letter.used 
                  ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-green-600 hover:bg-green-500 text-white border-green-400 hover:scale-105 cursor-pointer'
                }
              `}
            >
              {letter.letter}
            </button>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <div className="text-gray-400 text-sm">
            Click letters to add them to your word
          </div>
        </div>
      </div>

      {/* Found Words */}
      {foundWords.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4 text-center">Found Words ({foundWords.length})</h3>
          
          <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto">
            {foundWords.map((word, index) => (
              <div
                key={index}
                className="bg-green-600/20 text-green-300 px-3 py-2 rounded-lg border border-green-500/30 font-semibold"
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}