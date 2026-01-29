// WordScrambleAnswer component to reveal the correct answer
import React from 'react';
import { WordScrambleAnswerProps } from '@/types/games/word-scramble';

export default function WordScrambleAnswer({
  word,
  show,
  isCorrect = false,
  attempts = 0
}: WordScrambleAnswerProps): JSX.Element {
  if (!show) return <></>;

  return (
    <div className={`
      bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border border-gray-600 mb-6
      transition-all duration-500 ease-in-out
    `}>
      <div className="text-center">
        <h3 className={`text-xl font-semibold mb-6 ${
          isCorrect ? 'text-green-400' : 'text-orange-400'
        }`}>
          {isCorrect ? '🎉 Correct Answer!' : '💭 The Answer Was:'}
        </h3>
        
        {/* Word Display */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex gap-2 flex-wrap justify-center">
            {word.split('').map((letter, index) => (
              <div
                key={index}
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
                  text-2xl sm:text-3xl font-bold rounded-lg border-2 shadow-lg
                  ${isCorrect 
                    ? 'bg-green-600 text-white border-green-400 animate-bounce' 
                    : 'bg-orange-600 text-white border-orange-400'
                  }
                `}
                style={{
                  animationDelay: isCorrect ? `${index * 0.1}s` : '0s',
                  animationDuration: isCorrect ? '0.6s' : '0s'
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Word Information */}
        <div className="space-y-4">
          <div className="text-gray-300">
            <p className="text-2xl font-bold mb-2">{word}</p>
            <p className="text-lg">
              {word.length} letter{word.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Performance Feedback */}
          {isCorrect && (
            <div className={`p-4 rounded-lg ${
              attempts === 1 
                ? 'bg-yellow-500/20 text-yellow-300' 
                : attempts <= 3 
                ? 'bg-green-500/20 text-green-300' 
                : attempts <= 6
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              <p className="font-semibold mb-1">
                {attempts === 1 && '🏆 Perfect! First try!'}
                {attempts > 1 && attempts <= 3 && '⭐ Excellent work!'}
                {attempts > 3 && attempts <= 6 && '👍 Good job!'}
                {attempts > 6 && '🎯 Well done, you got it!'}
              </p>
              <p className="text-sm opacity-90">
                Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {!isCorrect && (
            <div className="bg-orange-500/20 text-orange-300 p-4 rounded-lg">
              <p className="font-semibold mb-1">💪 Don't give up!</p>
              <p className="text-sm opacity-90">
                Try a new word to practice your unscrambling skills
              </p>
            </div>
          )}
        </div>

        {/* Word Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{word.length}</div>
            <div className="text-xs text-gray-400">Letters</div>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {(word.match(/[AEIOU]/gi) || []).length}
            </div>
            <div className="text-xs text-gray-400">Vowels</div>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">
              {word.length - (word.match(/[AEIOU]/gi) || []).length}
            </div>
            <div className="text-xs text-gray-400">Consonants</div>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              {new Set(word.toLowerCase().split('')).size}
            </div>
            <div className="text-xs text-gray-400">Unique</div>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-6 text-gray-400 text-sm">
          {isCorrect 
            ? '🎮 Ready for another challenge? Click "New Word" to continue!' 
            : '🔄 Click "New Word" to try a different scramble!'
          }
        </div>
      </div>
    </div>
  );
}