// WhackMoleGameOverModal component to display game over results
import React from 'react';
import { WhackMoleGameOverModalProps } from '@/types/games/whack-a-mole';
import { getWhackPerformanceRating } from '@/utility/games/whack-a-mole';

export default function WhackMoleGameOverModal({
  score,
  accuracy = 0,
  molesHit = 0,
  totalMoles = 0,
  onRestart
}: WhackMoleGameOverModalProps): JSX.Element {
  const rating = getPerformanceRating(score);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">🎯 Game Over!</h2>
          <p className="text-gray-300">Time's up! Here's how you did:</p>
        </div>

        {/* Performance Rating */}
        <div className="text-center mb-6">
          <div className={`text-2xl font-bold ${rating.color} mb-2`}>
            {rating.text}
          </div>
          <p className="text-gray-400 text-sm">{rating.description}</p>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300">Final Score</span>
            <span className="text-2xl font-bold text-yellow-400">{score}</span>
          </div>
          
          {totalMoles > 0 && (
            <>
              <div className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Moles Hit</span>
                <span className="text-xl font-semibold text-green-400">{molesHit}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Total Moles</span>
                <span className="text-xl font-semibold text-white">{totalMoles}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Accuracy</span>
                <span className={`text-xl font-semibold ${
                  accuracy >= 80 ? 'text-green-400' :
                  accuracy >= 60 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}>
                  {accuracy}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔨 Play Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tips */}
        {accuracy < 50 && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Tips:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Focus on the center of the grid</li>
              <li>• React quickly to movement</li>
              <li>• Don't click empty holes</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}