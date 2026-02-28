// GameControls component for game actions
import React from 'react';
import { GameControlsProps } from '@/types/games/word-guess';

export default function GameControls({
  onRemoveLast,
  onUseHint,
  onGuess,
  onRestart,
  chosenLetters,
  hints,
  disabled
}: GameControlsProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        Game Controls
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Actions */}
        <div className="space-y-3">
          <button
            onClick={onGuess}
            disabled={chosenLetters.length === 0 || disabled}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 transform
              ${chosenLetters.length > 0 && !disabled
                ? 'bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🎯 Check Word
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔄 New Word
          </button>
        </div>

        {/* Helper Actions */}
        <div className="space-y-3">
          <button
            onClick={onRemoveLast}
            disabled={chosenLetters.length === 0 || disabled}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
              ${chosenLetters.length > 0 && !disabled
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            ⬅️ Remove Last
          </button>

          <button
            onClick={onUseHint}
            disabled={hints <= 0 || disabled}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 relative
              ${hints > 0 && !disabled
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            💡 Use Hint
            {hints > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {hints}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Control Information */}
      <div className="mt-6 space-y-3">
        {/* Hints Info */}
        <div className="text-center">
          <div className={`text-sm font-medium ${hints > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
            {hints > 0 ? (
              <>💡 {hints} hint{hints !== 1 ? 's' : ''} remaining</>
            ) : (
              <>💡 No hints remaining</>
            )}
          </div>
        </div>

        {/* Selected Letters Info */}
        {chosenLetters.length > 0 && (
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">
              Last selected: <span className="text-white font-medium">{chosenLetters[chosenLetters.length - 1]}</span>
            </div>
          </div>
        )}

        {/* Game Status */}
        {disabled && (
          <div className="text-center">
            <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm">
              🎮 Game finished - Click "New Word" to play again
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      {!disabled && (
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <h4 className="text-gray-300 font-semibold text-sm mb-2">💡 Tips:</h4>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Start with common vowels (A, E, I, O, U)</li>
            <li>• Try frequent consonants (R, S, T, L, N)</li>
            <li>• Use hints wisely - they cost points!</li>
            <li>• Remove last letter if you make a mistake</li>
          </ul>
        </div>
      )}
    </div>
  );
}