import React from 'react';

interface PerformanceRating {
  text: string;
  color: string;
}

interface Props {
  averageTime: number;
  bestTime: number;
  reactionTimes: number[];
  performanceRating: PerformanceRating;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function ReactionCompletedModal({ averageTime, bestTime, reactionTimes, performanceRating, onPlayAgain, onBackToMenu }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 via-indigo-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border-2 border-indigo-500/50 shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-4xl font-bold text-white mb-2">Test Complete!</h2>
          <p className={`${performanceRating.color} text-2xl font-bold`}>{performanceRating.text}</p>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Average Time:</span>
            <span className="text-3xl font-bold text-indigo-400">{averageTime}ms</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Best Time:</span>
            <span className="text-2xl font-bold text-green-400">{bestTime}ms</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <span className="text-gray-300 font-semibold">Worst Time:</span>
            <span className="text-2xl font-bold text-red-400">{Math.max(...reactionTimes)}ms</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-semibold">Consistency:</span>
            <span className="text-2xl font-bold text-purple-400">{Math.round((1 - (Math.max(...reactionTimes) - Math.min(...reactionTimes)) / averageTime) * 100)}%</span>
          </div>
        </div>

        <div className="bg-indigo-600/20 rounded-xl p-4 mb-6 border border-indigo-500/30">
          <h3 className="text-white font-semibold mb-3 text-center">Round Times</h3>
          <div className="grid grid-cols-5 gap-2">
            {reactionTimes.map((time, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-400 mb-1">R{index + 1}</div>
                <div className={`text-sm font-bold ${time === bestTime ? 'text-green-400' : time === Math.max(...reactionTimes) ? 'text-red-400' : 'text-white'}`}>{time}ms</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-600/20 rounded-xl p-4 mb-6 border border-yellow-500/30">
          <p className="text-center text-yellow-200 text-sm">
            {averageTime < 250
              ? '🎯 Elite reflexes! You\'re in the top tier!'
              : averageTime < 300
                ? '👏 Great performance! With practice, you can get even faster!'
                : averageTime < 350
                  ? '📈 Good work! Focus on anticipating the color change.'
                  : '💡 Tip: Stay focused and relaxed. Tension slows your reactions!'}
          </p>
        </div>

        <div className="flex gap-4">
          <button onClick={onPlayAgain} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">Test Again</button>

          <button onClick={onBackToMenu} className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">Main Menu</button>
        </div>
      </div>
    </div>
  );
}
