import React from 'react';
import StreakCounter from './StreakCounter';

export default function EmojiGuessHeader({ streak }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2 animate-pulse">
        🎭 Emoji Guess
      </h1>
      <p className="text-subtle-text text-lg">Decode the emoji combination and guess what it represents!</p>
      {streak > 0 && (
        <div className="mt-4 flex justify-center">
          <StreakCounter streak={streak} />
        </div>
      )}
    </div>
  );
}