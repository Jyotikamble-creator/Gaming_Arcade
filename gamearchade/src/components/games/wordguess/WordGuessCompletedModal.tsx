// WordGuessCompletedModal component to display game completion results
import React from 'react';
import { WordGuessCompletedModalProps } from '@/types/games/word-guess';
import { getPerformanceRating, WORD_GUESS_CONSTANTS } from '@/utility/games/word-guess';

export default function WordGuessCompletedModal({
  isOpen,
  isWon,
  score,
  word,
  chosenLetters,
  wrongGuesses,
  hintsUsed,
  onClose,
  onNewGame
}: WordGuessCompletedModalProps): JSX.Element {
  if (!isOpen) return <></>;

  const rating = getPerformanceRating(isWon, score, wrongGuesses, hintsUsed);
  const maxHints = WORD_GUESS_CONSTANTS.MAX_HINTS;
  const correctLetters = chosenLetters.filter(letter => word.includes(letter));
  const wrongLetters = chosenLetters.filter(letter => !word.includes(letter));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isWon ? '🎉 Congratulations!' : '💥 Game Over!'}
          </h2>
          <div className={`text-2xl font-bold ${rating.color} mb-2`}>
            {rating.text}
          </div>
          <p className="text-gray-400">{rating.description}</p>
        </div>

        {/* Word Display */}
        <div className="text-center mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">The Word Was:</h3>
          <div className="flex justify-center gap-2 mb-4">
            {word.split('').map((letter, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg border-2
                  ${isWon 
                    ? 'bg-green-600 text-white border-green-400' 
                    : 'bg-red-600 text-white border-red-400'
                  }
                `}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-gray-300">{word.length} letters</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
            <div className="text-gray-300 text-sm">Final Score</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              wrongGuesses === 0 ? 'text-green-400' :
              wrongGuesses <= 1 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {wrongGuesses}/{WORD_GUESS_CONSTANTS.MAX_WRONG_GUESSES}
            </div>
            <div className="text-gray-300 text-sm">Wrong Guesses</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              hintsUsed === 0 ? 'text-green-400' :
              hintsUsed <= 1 ? 'text-yellow-400' :
              'text-orange-400'
            }`}>
              {hintsUsed}/{maxHints}
            </div>
            <div className="text-gray-300 text-sm">Hints Used</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{chosenLetters.length}</div>
            <div className="text-gray-300 text-sm">Total Letters</div>
          </div>
        </div>

        {/* Letter Analysis */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Correct Letters */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-3">
              ✅ Correct Letters ({correctLetters.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {correctLetters.length > 0 ? (
                correctLetters.map((letter, index) => (
                  <span
                    key={index}
                    className="bg-green-600/20 text-green-300 px-3 py-1 rounded-lg border border-green-500/30 font-medium"
                  >
                    {letter}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No correct letters</span>
              )}
            </div>
          </div>

          {/* Wrong Letters */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-3">
              ❌ Wrong Letters ({wrongLetters.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {wrongLetters.length > 0 ? (
                wrongLetters.map((letter, index) => (
                  <span
                    key={index}
                    className="bg-red-600/20 text-red-300 px-3 py-1 rounded-lg border border-red-500/30 font-medium"
                  >
                    {letter}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No wrong letters</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full py-3 px-6 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎮 Play Again
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Close
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Tips */}
        {!isWon && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Tips for next time:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Start with vowels (A, E, I, O, U)</li>
              <li>• Try common consonants (R, S, T, L, N)</li>
              <li>• Use hints when you're really stuck</li>
              <li>• Think about the word category for clues</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}