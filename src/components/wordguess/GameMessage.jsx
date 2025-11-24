import React from 'react';

const GameMessage = ({ message, word, showWord }) => {
  if (!message) return null;

  const isWin = message.toLowerCase().includes('win');
  const isGameOver = message.toLowerCase().includes('game over');

  return (
    <div className={`text-center p-4 rounded-lg mb-6 ${
      isWin
        ? 'bg-green-900/50 border border-green-700'
        : isGameOver
          ? 'bg-red-900/50 border border-red-700'
          : 'bg-blue-900/50 border border-blue-700'
    }`}>
      <div className={`text-xl font-bold mb-2 ${
        isWin ? 'text-green-400' : isGameOver ? 'text-red-400' : 'text-blue-400'
      }`}>
        {message}
      </div>
      {showWord && word && (
        <div className="text-lg text-gray-300">
          The word was: <span className="font-mono font-bold text-white">{word}</span>
        </div>
      )}
    </div>
  );
};

export default GameMessage;