// WordScrambleCompletedModal component to display game completion results
import React from 'react';
import { WordScrambleCompletedModalProps } from '@/types/games/word-scramble';

export default function WordScrambleCompletedModal({
  isOpen,
  isCorrect,
  score,
  word,
  scrambled,
  attempts,
  guess,
  gameTime = 0,
  onClose,
  onNewGame
}: WordScrambleCompletedModalProps): JSX.Element {
  if (!isOpen) return <></>;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    if (!isCorrect) {
      return {
        text: '💪 Keep Trying!',
        color: 'text-orange-400',
        description: 'Practice makes perfect!'
      };
    }

    if (attempts === 1) {
      return {
        text: '🏆 Perfect!',
        color: 'text-yellow-400',
        description: 'Amazing! You got it on the first try!'
      };
    } else if (attempts <= 3) {
      return {
        text: '⭐ Excellent!',
        color: 'text-blue-400',
        description: 'Outstanding word unscrambling skills!'
      };
    } else if (attempts <= 6) {
      return {
        text: '👍 Great Job!',
        color: 'text-green-400',
        description: 'Well done! Good problem solving!'
      };
    } else {
      return {
        text: '🎯 Good Effort!',
        color: 'text-purple-400',
        description: 'Nice work figuring it out!'
      };
    }
  };

  const rating = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isCorrect ? '🎉 Word Unscrambled!' : '🎯 Good Try!'}
          </h2>
          <div className={`text-2xl font-bold ${rating.color} mb-2`}>
            {rating.text}
          </div>
          <p className="text-gray-400">{rating.description}</p>
        </div>

        {/* Word Display */}
        <div className="text-center mb-6 space-y-4">
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Original Scramble:</h3>
            <div className="flex justify-center gap-2 mb-4">
              {scrambled.split('').map((letter, index) => (
                <div
                  key={index}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg bg-purple-600 text-white border border-purple-400"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Correct Answer:</h3>
            <div className="flex justify-center gap-2 mb-4">
              {word.split('').map((letter, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-600 text-white border-green-400' 
                      : 'bg-orange-600 text-white border-orange-400'
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-gray-300 text-lg font-bold">{word}</p>
          </div>

          {guess && guess !== word && (
            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Your Guess:</h3>
              <div className="bg-red-600/20 text-red-300 px-4 py-2 rounded-lg">
                {guess}
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
            <div className="text-gray-300 text-sm">Score</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              attempts === 1 ? 'text-yellow-400' :
              attempts <= 3 ? 'text-green-400' :
              attempts <= 6 ? 'text-blue-400' :
              'text-purple-400'
            }`}>
              {attempts}
            </div>
            <div className="text-gray-300 text-sm">Attempts</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{formatTime(gameTime)}</div>
            <div className="text-gray-300 text-sm">Time</div>
          </div>
          
          <div className="text-center py-3 px-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{word.length}</div>
            <div className="text-gray-300 text-sm">Letters</div>
          </div>
        </div>

        {/* Word Analysis */}
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-3">📊 Word Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-green-400 font-bold">{(word.match(/[AEIOU]/gi) || []).length}</div>
              <div className="text-gray-400">Vowels</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">{word.length - (word.match(/[AEIOU]/gi) || []).length}</div>
              <div className="text-gray-400">Consonants</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold">{new Set(word.toLowerCase().split('')).size}</div>
              <div className="text-gray-400">Unique Letters</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">{word[0]}</div>
              <div className="text-gray-400">First Letter</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full py-3 px-6 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 New Word
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
        {!isCorrect && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Tips for unscrambling:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Look for common letter patterns (TH, ING, ED)</li>
              <li>• Try starting with vowels or common letters</li>
              <li>• Break longer words into smaller parts</li>
              <li>• Think about word categories and contexts</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}