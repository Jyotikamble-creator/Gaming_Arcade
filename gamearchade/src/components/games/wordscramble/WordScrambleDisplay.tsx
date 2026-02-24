// WordScrambleDisplay component to show the scrambled word
import React from 'react';
import { WordScrambleDisplayProps } from '@/types/games/word-scramble';

export default function WordScrambleDisplay({
  scrambled,
  isLoading = false
}: WordScrambleDisplayProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
        <h3 className="text-white text-lg font-semibold mb-6 text-center">Scrambled Word</h3>
        <div className="flex justify-center items-center min-h-[80px]">
          <div className="flex gap-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-14 h-14 bg-gray-600 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
      <h3 className="text-white text-lg font-semibold mb-6 text-center">
        🔀 Scrambled Word
      </h3>
      
      <div className="flex justify-center items-center mb-6">
        <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
          {scrambled.split('').map((letter, index) => (
            <div
              key={index}
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
                         text-2xl sm:text-3xl font-bold rounded-lg border-2 
                         bg-gradient-to-br from-purple-600 to-blue-600 
                         text-white border-purple-400 shadow-lg 
                         transform hover:scale-105 transition-all duration-200"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInScale 0.5s ease-out forwards'
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="text-gray-300">
          <span className="text-lg font-semibold">{scrambled.length}</span>
          <span className="text-sm"> letters to unscramble</span>
        </div>
        
        <div className="text-gray-400 text-sm">
          Rearrange these letters to form a word
        </div>
        
        {/* Letter frequency hint */}
        <div className="text-gray-500 text-xs">
          Letters: {scrambled.split('').join(' • ')}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}