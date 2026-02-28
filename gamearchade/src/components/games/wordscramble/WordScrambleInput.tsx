// WordScrambleInput component for guess input and controls
import React from 'react';
import { WordScrambleInputProps } from '@/types/games/word-scramble';

export default function WordScrambleInput({
  guess,
  onChange,
  onCheck,
  onReveal,
  onNewWord,
  correct,
  showAnswer,
  disabled = false,
  attempts = 0,
  maxAttempts = 10
}: WordScrambleInputProps): JSX.Element {
  const isGameOver = correct || showAnswer || disabled;
  const hasReachedMaxAttempts = attempts >= maxAttempts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGameOver && guess.trim() && !hasReachedMaxAttempts) {
      onCheck();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGameOver && guess.trim() && !hasReachedMaxAttempts) {
      onCheck();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        Your Answer
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={guess}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGameOver || hasReachedMaxAttempts}
              placeholder={isGameOver ? "Game finished" : "Enter your guess..."}
              className={`
                w-full px-4 py-3 text-xl font-semibold text-center rounded-lg border-2
                transition-all duration-200 focus:outline-none focus:ring-2
                ${isGameOver || hasReachedMaxAttempts
                  ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                }
              `}
              maxLength={20}
            />
            
            {guess && !isGameOver && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Check Answer Button */}
          <button
            type="submit"
            disabled={!guess.trim() || isGameOver || hasReachedMaxAttempts}
            className={`
              px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform
              ${!guess.trim() || isGameOver || hasReachedMaxAttempts
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105 shadow-lg'
              }
            `}
          >
            {correct ? '✅ Correct!' : '🎯 Check Answer'}
          </button>

          {/* Reveal Answer Button */}
          {!correct && !showAnswer && (
            <button
              type="button"
              onClick={onReveal}
              disabled={isGameOver}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              💡 Reveal Answer
            </button>
          )}

          {/* New Word Button */}
          <button
            type="button"
            onClick={onNewWord}
            className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔄 New Word
          </button>
        </div>
      </form>

      {/* Status Messages */}
      <div className="mt-4 space-y-2">
        {hasReachedMaxAttempts && !correct && (
          <div className="text-center bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm">
            ❌ Maximum attempts reached! Try a new word.
          </div>
        )}

        {guess.length > 15 && (
          <div className="text-center bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg text-sm">
            ⚠️ That seems quite long. Are you sure?
          </div>
        )}

        {!isGameOver && !hasReachedMaxAttempts && attempts > 0 && (
          <div className="text-center text-gray-400 text-sm">
            💭 Attempt {attempts} of {maxAttempts}
          </div>
        )}

        {!isGameOver && attempts === 0 && (
          <div className="text-center text-gray-400 text-sm">
            💡 Type your guess and press Enter or click "Check Answer"
          </div>
        )}
      </div>

      {/* Input Validation */}
      {guess && !/^[A-Za-z]+$/.test(guess) && (
        <div className="mt-2 text-center bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg text-sm">
          ⚠️ Please use only letters (A-Z)
        </div>
      )}
    </div>
  );
}