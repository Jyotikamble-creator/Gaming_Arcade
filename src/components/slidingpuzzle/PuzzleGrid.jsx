import React from 'react';

export default function PuzzleGrid({
  tiles,
  gridSize,
  onTileClick,
  isShuffling,
  gameCompleted,
  onShuffle,
  onReset
}) {
  const tileSize = 80;
  const gap = 4;

  return (
    <div className="mb-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {/* Game Status */}
        <div className="text-center mb-6">
          {isShuffling && (
            <div className="text-yellow-400 font-semibold mb-2">
              🔀 Shuffling puzzle...
            </div>
          )}
          {gameCompleted && (
            <div className="text-green-400 font-semibold mb-2">
              🎉 Puzzle Solved!
            </div>
          )}
        </div>

        {/* Puzzle Grid */}
        <div
          className="grid mx-auto mb-6"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
            gap: `${gap}px`,
            width: `${gridSize * tileSize + (gridSize - 1) * gap}px`,
          }}
        >
          {tiles.map((tile, index) => (
            <div
              key={index}
              onClick={() => onTileClick(index)}
              className={`
                relative rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${tile === null
                  ? 'bg-gray-900 border-gray-600'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 hover:border-blue-300 hover:scale-105'
                }
                ${isShuffling ? 'animate-pulse' : ''}
                ${gameCompleted ? 'cursor-default' : ''}
              `}
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
              }}
            >
              {tile !== null && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xl select-none">
                    {tile}
                  </span>
                </div>
              )}

              {/* Win celebration effect */}
              {gameCompleted && tile !== null && (
                <div className="absolute inset-0 bg-green-500/20 rounded-lg animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="text-center space-x-4">
          <button
            onClick={onShuffle}
            disabled={isShuffling}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            {isShuffling ? '🔀 Shuffling...' : '🎲 New Puzzle'}
          </button>

          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            🔄 Reset
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-subtle-text text-sm">
          <p>Click on tiles adjacent to the empty space to slide them.</p>
          <p>Arrange numbers 1-15 in order with the empty space at bottom right.</p>
        </div>
      </div>
    </div>
  );
}
