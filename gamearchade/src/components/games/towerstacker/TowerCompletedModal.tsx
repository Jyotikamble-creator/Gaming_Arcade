// TowerCompletedModal component to show game completion modal
import React from 'react';
import { TowerCompletedModalProps } from '../../../../src/types/towerStacker';
import { getPerformanceRating, GAME_CONFIG } from '../../../../src/utils/towerStackerUtils';

export default function TowerCompletedModal({ score, level, perfectDrops, onPlayAgain }: TowerCompletedModalProps): JSX.Element {
  const rating = getPerformanceRating(level);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-blue-500 shadow-2xl">
        <div className="text-center">
          <h2 className={`text-4xl font-bold mb-4 ${rating.color}`}>
            {rating.text}
          </h2>

          <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-subtle-text text-sm mb-1">Final Score</p>
                <p className="text-2xl font-bold text-blue-400">{score}</p>
              </div>
              <div>
                <p className="text-subtle-text text-sm mb-1">Level Reached</p>
                <p className="text-2xl font-bold text-green-400">{level}</p>
              </div>
              <div>
                <p className="text-subtle-text text-sm mb-1">Perfect Drops</p>
                <p className="text-2xl font-bold text-purple-400">{perfectDrops}</p>
              </div>
            </div>

            {level >= GAME_CONFIG.MAX_LEVELS && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm font-semibold">
                  🎉 Perfect Tower! You completed all {GAME_CONFIG.MAX_LEVELS} levels!
                </p>
              </div>
            )}

            {perfectDrops >= 5 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
                <p className="text-purple-400 text-sm font-semibold">
                  ✨ Combo Master! {perfectDrops} perfect drops in a row!
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <span className="mr-2">💡</span> Pro Tips:
            </h3>
            <ul className="text-subtle-text text-sm space-y-1">
              <li>• Perfect drops (±{GAME_CONFIG.PERFECT_DROP_THRESHOLD}px) earn 20 bonus points</li>
              <li>• Build combo streaks for extra points</li>
              <li>• Speed increases every 5 levels</li>
              <li>• Reach level {GAME_CONFIG.MAX_LEVELS} to win the game!</li>
            </ul>
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}