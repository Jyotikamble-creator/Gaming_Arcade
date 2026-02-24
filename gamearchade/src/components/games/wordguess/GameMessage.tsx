// GameMessage component to display game messages and word reveal
import React from 'react';
import { GameMessageProps } from '@/types/games/word-guess';

export default function GameMessage({
  message,
  word,
  showWord,
  isWon,
  isGameOver
}: GameMessageProps): JSX.Element {
  if (!message && !showWord) return <></>;

  const getMessageStyles = () => {
    if (isWon) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    } else if (isGameOver) {
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    } else {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getMessageIcon = () => {
    if (isWon) {
      return '🎉';
    } else if (isGameOver) {
      return '💥';
    } else {
      return '📢';
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Main Message */}
      {message && (
        <div className={`
          text-center p-6 rounded-xl border transition-all duration-300 animate-pulse
          ${getMessageStyles()}
        `}>
          <p className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{getMessageIcon()}</span>
            {message}
          </p>
          
          {isWon && (
            <p className="text-lg opacity-90">
              Congratulations! You guessed the word correctly!
            </p>
          )}
          
          {isGameOver && !isWon && (
            <p className="text-lg opacity-90">
              Better luck next time! Try a new word to play again.
            </p>
          )}
        </div>
      )}

      {/* Word Reveal */}
      {showWord && (
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
          <h3 className="text-white text-lg font-semibold mb-4 text-center">
            {isWon ? '🏆 The word was:' : '💭 The word was:'}
          </h3>
          
          <div className="flex justify-center items-center mb-4">
            <div className="flex gap-2 flex-wrap justify-center">
              {word.split('').map((letter, index) => (
                <div
                  key={index}
                  className={`
                    w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
                    text-2xl sm:text-3xl font-bold rounded-lg border-2
                    ${isWon 
                      ? 'bg-green-600 text-white border-green-400 shadow-lg animate-bounce' 
                      : 'bg-red-600 text-white border-red-400 shadow-lg'
                    }
                  `}
                  style={{
                    animationDelay: isWon ? `${index * 0.1}s` : '0s',
                    animationDuration: isWon ? '0.6s' : '0s'
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-gray-300">
            <p className="text-lg font-medium">
              {word} - {word.length} letters
            </p>
          </div>
        </div>
      )}

      {/* Game Over Actions */}
      {isGameOver && (
        <div className="text-center space-y-3">
          <div className="text-gray-400 text-sm">
            {isWon 
              ? '🎮 Ready for another challenge?' 
              : '🎮 Want to try again with a new word?'
            }
          </div>
        </div>
      )}
    </div>
  );
}