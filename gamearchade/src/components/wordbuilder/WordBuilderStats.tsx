// WordBuilderStats component to display game statistics
import React from 'react';
import { WordBuilderStatsProps } from '@/types/games/word-builder';

export default function WordBuilderStats({
  difficulty,
  time,
  wordsFound,
  totalWords,
  minWords,
  score,
  hintsUsed
}: WordBuilderStatsProps): JSX.Element {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string): string => {
    switch (diff) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressPercentage = (): number => {
    return Math.min((wordsFound / minWords) * 100, 100);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">Game Stats</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{score}</div>
          <div className="text-gray-300 text-sm">Score</div>
        </div>

        {/* Time */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{formatTime(time)}</div>
          <div className="text-gray-300 text-sm">Time</div>
        </div>

        {/* Words Found */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {wordsFound}/{totalWords}
          </div>
          <div className="text-gray-300 text-sm">Words Found</div>
        </div>

        {/* Hints Used */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{hintsUsed}</div>
          <div className="text-gray-300 text-sm">Hints Used</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">
            Progress to complete ({minWords} words minimum)
          </span>
          <span className={`text-sm font-semibold ${getDifficultyColor(difficulty)}`}>
            {difficulty.toUpperCase()}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-gray-400 text-sm">
            {Math.round(getProgressPercentage())}% complete
          </span>
        </div>
      </div>

      {/* Completion Status */}
      {wordsFound >= minWords && (
        <div className="mt-4 text-center">
          <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
            🎉 Minimum words found! Keep going for bonus points!
          </div>
        </div>
      )}
    </div>
  );
}