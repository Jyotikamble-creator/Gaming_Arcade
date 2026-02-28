// WordDisplay component to show the word with revealed/hidden letters
import React from 'react';
import { WordDisplayProps } from '@/types/games/word-guess';
import { formatWordDisplay, getWordCompletionPercentage } from '@/utility/games/word-guess';

export default function WordDisplay({
  word,
  chosenLetters,
  showWord = false
}: WordDisplayProps): JSX.Element {
  const displayWord = formatWordDisplay(word, chosenLetters, showWord);
  const completionPercentage = getWordCompletionPercentage(word, chosenLetters);
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-6 text-center">
        {showWord ? 'The Word Was:' : 'Guess the Word'}
      </h3>
      
      {/* Word Letters Display */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
          {word.split('').map((letter, index) => {
            const isRevealed = chosenLetters.includes(letter) || showWord;
            return (
              <div
                key={index}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
                  text-2xl sm:text-3xl font-bold rounded-lg border-2 transition-all duration-300
                  ${isRevealed 
                    ? 'bg-green-600 text-white border-green-400 shadow-lg transform scale-105' 
                    : 'bg-gray-600 text-transparent border-gray-500'
                  }
                `}
              >
                {isRevealed ? letter : '_'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Word Information */}
      <div className="text-center space-y-3">
        <div className="text-gray-300">
          <span className="text-lg font-semibold">{word.length}</span>
          <span className="text-sm"> letters</span>
        </div>
        
        {!showWord && (
          <div className="space-y-2">
            <div className="text-gray-400 text-sm">
              Progress: {completionPercentage}% complete
            </div>
            
            <div className="w-full max-w-xs mx-auto bg-gray-700 rounded-full h-2">
              <div
                className="bg-linear-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Letter count info */}
        <div className="text-gray-400 text-sm">
          {showWord ? (
            <span>Word revealed</span>
          ) : (
            <span>
              {chosenLetters.filter(letter => word.includes(letter)).length} of {[...new Set(word.split(''))].length} unique letters found
            </span>
          )}
        </div>
      </div>

      {/* Visual feedback for completion */}
      {completionPercentage === 100 && !showWord && (
        <div className="mt-4 text-center">
          <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg inline-block border border-green-500/30">
            🎉 Word Complete!
          </div>
        </div>
      )}
    </div>
  );
}