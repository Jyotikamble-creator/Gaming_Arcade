import React from 'react';

const MazeGrid = ({ grid, playerPos, visited, isGenerating, onMove, onReset }) => {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center w-96 h-96 bg-gray-800/50 rounded-xl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white text-sm">Generating maze...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const isPlayer = playerPos[0] === i && playerPos[1] === j;
            const isVisited = visited.has(`${i},${j}`);
            const isStart = i === 0 && j === 0;

            return (
              <div
                key={`${i}-${j}`}
                className={`
                  w-16 h-16 rounded-lg flex items-center justify-center text-sm font-bold
                  transition-all duration-200 cursor-pointer border-2
                  ${isPlayer
                    ? 'bg-yellow-500 border-yellow-300 text-black shadow-lg scale-110'
                    : isVisited
                      ? 'bg-gray-600 border-gray-500 text-gray-300'
                      : cell >= 0
                        ? 'bg-green-600 border-green-500 text-white hover:bg-green-500'
                        : 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                  }
                  ${isStart ? 'ring-2 ring-blue-400' : ''}
                `}
                onClick={() => !isPlayer && !isVisited && onMove([i - playerPos[0], j - playerPos[1]])}
              >
                {isPlayer ? '🚶' : cell}
              </div>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          New Maze
        </button>
        <div className="text-white text-sm self-center">
          Use arrow keys or WASD to move
        </div>
      </div>
    </div>
  );
};

export default MazeGrid;