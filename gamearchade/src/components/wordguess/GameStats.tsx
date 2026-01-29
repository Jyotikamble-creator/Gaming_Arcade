// GameStats component to display game statistics
import React from 'react';
import { GameStatsProps } from '@/types/games/word-guess';

export default function GameStats({
  score,
  wrongGuesses,
  maxWrongGuesses,
  hints,
  maxHints
}: GameStatsProps): JSX.Element {
  const remainingGuesses = maxWrongGuesses - wrongGuesses;
  const hintsUsed = maxHints - hints;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">Game Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{score}</div>
          <div className="text-gray-300 text-sm">Score</div>
        </div>

        {/* Wrong Guesses */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            wrongGuesses === 0 ? 'text-green-400' :
            wrongGuesses === 1 ? 'text-yellow-400' :
            wrongGuesses === 2 ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {wrongGuesses}/{maxWrongGuesses}
          </div>
          <div className="text-gray-300 text-sm">Wrong</div>
        </div>

        {/* Remaining Guesses */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            remainingGuesses === 3 ? 'text-green-400' :
            remainingGuesses === 2 ? 'text-yellow-400' :
            remainingGuesses === 1 ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {remainingGuesses}
          </div>
          <div className="text-gray-300 text-sm">Remaining</div>
        </div>

        {/* Hints */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            hints > 0 ? 'text-blue-400' : 'text-gray-500'
          }`}>
            {hints}
          </div>
          <div className="text-gray-300 text-sm">Hints</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6 space-y-4">
        {/* Wrong Guesses Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Wrong Guesses</span>
            <span className="text-gray-400 text-xs">
              {wrongGuesses}/{maxWrongGuesses}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                wrongGuesses === 0 ? 'bg-green-500' :
                wrongGuesses === 1 ? 'bg-yellow-500' :
                wrongGuesses === 2 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(wrongGuesses / maxWrongGuesses) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Hints Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Hints Used</span>
            <span className="text-gray-400 text-xs">
              {hintsUsed}/{maxHints}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(hintsUsed / maxHints) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-4 space-y-2">
        {wrongGuesses === maxWrongGuesses - 1 && (
          <div className="text-center bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm">
            ⚠️ Last chance! One more wrong guess and it's game over!
          </div>
        )}
        
        {hints === 0 && (
          <div className="text-center bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm">
            💡 No more hints available
          </div>
        )}
        
        {score > 50 && (
          <div className="text-center bg-green-500/20 text-green-300 px-4 py-2 rounded-lg text-sm">
            🌟 Great job! You're doing well!
          </div>
        )}
      </div>
    </div>
  );
}