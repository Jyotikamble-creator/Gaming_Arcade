import React from 'react';

const GameControls = ({ gameState, onStart, onReset, onSave, score }) => {
  return (
    <div className="bg-gray-100 p-4 rounded space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Controls</h3>
      <button
        className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        onClick={onStart}
        disabled={gameState === 'playing'}
      >
        {gameState === 'ready' ? 'Start Game' : 'Restart'}
      </button>
      <button
        className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={onReset}
      >
        Reset
      </button>
      <button
        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={onSave}
        disabled={score === 0}
      >
        Save Score
      </button>
    </div>
  );
};

export default GameControls;