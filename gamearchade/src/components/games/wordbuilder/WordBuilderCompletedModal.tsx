// WordBuilderCompletedModal component to display game completion results
import React from 'react';
import { WordBuilderCompletedModalProps } from '@/types/games/word-builder';

export default function WordBuilderCompletedModal({
  isOpen,
  score,
  wordsFound,
  totalWords,
  allWords,
  time,
  difficulty,
  hintsUsed,
  onClose,
  onNewGame
}: WordBuilderCompletedModalProps): JSX.Element {
  if (!isOpen) return <></>;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    const completionRate = (wordsFound.length / totalWords) * 100;
    const difficultyMultiplier = { easy: 1, medium: 1.2, hard: 1.5 }[difficulty];
    const adjustedScore = score * difficultyMultiplier;

    if (adjustedScore >= 500 && completionRate >= 80) {
      return {
        text: '🏆 Master Builder!',
        color: 'text-yellow-400',
        description: 'Outstanding word construction skills!'
      };
    } else if (adjustedScore >= 300 && completionRate >= 60) {
      return {
        text: '⭐ Word Expert!',
        color: 'text-blue-400',
        description: 'Excellent vocabulary and strategy!'
      };
    } else if (adjustedScore >= 200 && completionRate >= 40) {
      return {
        text: '👍 Good Builder!',
        color: 'text-green-400',
        description: 'Nice word formation abilities!'
      };
    } else if (adjustedScore >= 100) {
      return {
        text: '📝 Getting Better!',
        color: 'text-yellow-500',
        description: 'Keep practicing your word skills!'
      };
    } else {
      return {
        text: '🎯 Keep Trying!',
        color: 'text-orange-400',
        description: 'Practice makes perfect!'
      };
    }
  };

  const rating = getPerformanceRating();
  const unfoundWords = allWords.filter(word => !wordsFound.includes(word));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">🎉 Game Complete!</h2>
          <div className={`text-2xl font-bold ${rating.color} mb-2`}>
            {rating.text}
          </div>
          <p className="text-gray-400">{rating.description}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
            <div className="text-gray-300 text-sm">Final Score</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{formatTime(time)}</div>
            <div className="text-gray-300 text-sm">Time</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{wordsFound.length}/{totalWords}</div>
            <div className="text-gray-300 text-sm">Words Found</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{hintsUsed}</div>
            <div className="text-gray-300 text-sm">Hints Used</div>
          </div>
        </div>

        {/* Words Found */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">Words You Found ({wordsFound.length})</h3>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-700/30 rounded-lg max-h-32 overflow-y-auto">
            {wordsFound.map((word, index) => (
              <span
                key={index}
                className="bg-green-600/20 text-green-300 px-3 py-1 rounded-lg border border-green-500/30 font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Missed Words */}
        {unfoundWords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">Words You Missed ({unfoundWords.length})</h3>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-700/30 rounded-lg max-h-32 overflow-y-auto">
              {unfoundWords.map((word, index) => (
                <span
                  key={index}
                  className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-lg border border-orange-500/30 font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full py-3 px-6 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            📝 Play Again
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
        {wordsFound.length < totalWords * 0.6 && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Tips for next time:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Try different letter combinations</li>
              <li>• Look for common prefixes and suffixes</li>
              <li>• Start with shorter words then build longer ones</li>
              <li>• Use hints when you're stuck</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}