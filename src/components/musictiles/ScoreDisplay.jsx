import React from 'react';

const ScoreDisplay = ({ score, level, gameState }) => {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Game Info</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Score:</span>
          <span className="font-bold text-gray-900">{score}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Level:</span>
          <span className="font-bold text-gray-900">{level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Status:</span>
          <span className={`font-bold ${
            gameState === 'ready' ? 'text-gray-600' :
            gameState === 'playing' ? 'text-blue-600' :
            gameState === 'waiting' ? 'text-green-600' :
            gameState === 'gameOver' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {gameState === 'ready' ? 'Ready' :
             gameState === 'playing' ? 'Watch' :
             gameState === 'waiting' ? 'Your Turn' :
             gameState === 'gameOver' ? 'Game Over' :
             'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;