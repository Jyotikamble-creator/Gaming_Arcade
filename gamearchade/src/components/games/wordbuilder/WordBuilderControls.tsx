// WordBuilderControls component for game controls and settings
import React from 'react';
import { WordBuilderControlsProps } from '@/types/games/word-builder';

export default function WordBuilderControls({
  onSubmit,
  onClear,
  onShuffle,
  onHint,
  onNewGame,
  onDifficultyChange,
  difficulty,
  isCompleted,
  canSubmit,
  hintsUsed,
  maxHints
}: WordBuilderControlsProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">Game Controls</h3>

      {/* Primary Actions */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isCompleted}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 transform
            ${canSubmit && !isCompleted
              ? 'bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          📝 Submit Word
        </button>

        <button
          onClick={onClear}
          disabled={isCompleted}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
            ${!isCompleted
              ? 'bg-orange-600 hover:bg-orange-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          🗑️ Clear Word
        </button>
      </div>

      {/* Helper Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onShuffle}
          disabled={isCompleted}
          className={`
            py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm
            ${!isCompleted
              ? 'bg-purple-600 hover:bg-purple-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          🔄 Shuffle
        </button>

        <button
          onClick={onHint}
          disabled={isCompleted || hintsUsed >= maxHints}
          className={`
            py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm
            ${!isCompleted && hintsUsed < maxHints
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          💡 Hint ({maxHints - hintsUsed})
        </button>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Difficulty Level
        </label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as 'easy' | 'medium' | 'hard')}
          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="easy">Easy (5 words minimum)</option>
          <option value="medium">Medium (7 words minimum)</option>
          <option value="hard">Hard (3 words minimum)</option>
        </select>
      </div>

      {/* New Game Button */}
      <button
        onClick={onNewGame}
        className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        🎮 New Game
      </button>

      {/* Game Status */}
      <div className="mt-4 text-center">
        {isCompleted && (
          <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
            🎉 Game Complete!
          </div>
        )}
        {hintsUsed > 0 && (
          <div className="text-yellow-400 text-sm mt-2">
            Hints used: {hintsUsed}/{maxHints}
          </div>
        )}
      </div>
    </div>
  );
}