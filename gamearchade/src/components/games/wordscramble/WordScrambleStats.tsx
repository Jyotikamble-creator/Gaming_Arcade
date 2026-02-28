// WordScrambleStats component to display game statistics
import React from 'react';
import { WordScrambleStatsProps } from '@/types/games/word-scramble';

export default function WordScrambleStats({
  attempts,
  correct,
  showAnswer,
  score = 0,
  maxAttempts = 10
}: WordScrambleStatsProps): JSX.Element {
  const getStatusColor = () => {
    if (correct) return 'text-green-400';
    if (showAnswer) return 'text-orange-400';
    if (attempts >= maxAttempts) return 'text-red-400';
    return 'text-blue-400';
  };

  const getStatusText = () => {
    if (correct) return 'Correct!';
    if (showAnswer) return 'Answer Revealed';
    if (attempts >= maxAttempts) return 'Max Attempts Reached';
    return 'In Progress';
  };

  const getProgressPercentage = () => {
    return Math.min((attempts / maxAttempts) * 100, 100);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">Game Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Attempts */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${
            attempts === 0 ? 'text-gray-400' :
            attempts <= 3 ? 'text-green-400' :
            attempts <= 6 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {attempts}
          </div>
          <div className="text-gray-300 text-sm">Attempts</div>
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{score}</div>
          <div className="text-gray-300 text-sm">Score</div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-lg font-bold mb-1 ${getStatusColor()}`}>
            {correct && '✅'}
            {showAnswer && !correct && '👁️'}
            {!correct && !showAnswer && '🎯'}
          </div>
          <div className="text-gray-300 text-sm">Status</div>
        </div>

        {/* Max Attempts */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-400 mb-1">{maxAttempts}</div>
          <div className="text-gray-300 text-sm">Max Attempts</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Progress</span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              correct ? 'bg-linear-to-r from-green-500 to-blue-500' :
              showAnswer ? 'bg-linear-to-r from-orange-500 to-red-500' :
              attempts >= maxAttempts ? 'bg-red-500' :
              'bg-linear-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-4">
        {correct && (
          <div className="text-center bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
            🎉 Congratulations! You unscrambled the word in {attempts} attempt{attempts !== 1 ? 's' : ''}!
          </div>
        )}
        
        {showAnswer && !correct && (
          <div className="text-center bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg">
            💭 Don't worry! Try a new word to practice more.
          </div>
        )}
        
        {!correct && !showAnswer && attempts > 0 && (
          <div className="text-center bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg">
            🎯 Keep trying! You have {maxAttempts - attempts} attempts remaining.
          </div>
        )}
        
        {attempts === 0 && !correct && !showAnswer && (
          <div className="text-center bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg">
            🚀 Ready to start? Look at the scrambled letters and make your guess!
          </div>
        )}
      </div>
    </div>
  );
}