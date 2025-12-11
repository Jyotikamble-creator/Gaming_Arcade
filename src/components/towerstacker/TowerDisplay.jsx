import React from 'react';

export default function TowerDisplay({ 
  tower, 
  currentBlock, 
  containerWidth, 
  blockHeight, 
  gameState, 
  onStart, 
  onDrop 
}) {
  const containerHeight = 600;
  const maxVisibleBlocks = Math.floor(containerHeight / blockHeight);

  // Calculate visible range (show top blocks)
  const visibleStart = Math.max(0, tower.length - maxVisibleBlocks + 2);
  const visibleTower = tower.slice(visibleStart);

  // Adjust y positions for visible blocks
  const adjustedTower = visibleTower.map((block, index) => ({
    ...block,
    displayY: containerHeight - ((visibleTower.length - index) * blockHeight),
  }));

  const adjustedCurrentBlock = currentBlock ? {
    ...currentBlock,
    displayY: containerHeight - blockHeight,
  } : null;

  return (
    <div className="mb-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {gameState === 'idle' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Stack?</h2>
            <p className="text-subtle-text mb-6">
              Click the block or press SPACE to drop it perfectly!
            </p>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState !== 'idle' && (
          <div>
            {/* Game Area */}
            <div 
              className="relative mx-auto bg-gray-900 rounded-lg border-2 border-gray-700"
              style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
            >
              {/* Tower Blocks */}
              {adjustedTower.map((block, index) => {
                const actualIndex = visibleStart + index;
                const hue = (actualIndex * 30) % 360;
                return (
                  <div
                    key={actualIndex}
                    className="absolute transition-all duration-100"
                    style={{
                      left: `${block.x}px`,
                      bottom: `${block.displayY}px`,
                      width: `${block.width}px`,
                      height: `${blockHeight}px`,
                      backgroundColor: `hsl(${hue}, 70%, 60%)`,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '4px',
                    }}
                  />
                );
              })}

              {/* Current Moving Block */}
              {adjustedCurrentBlock && gameState === 'playing' && (
                <div
                  className="absolute transition-all duration-100"
                  style={{
                    left: `${adjustedCurrentBlock.x}px`,
                    bottom: `${adjustedCurrentBlock.displayY}px`,
                    width: `${adjustedCurrentBlock.width}px`,
                    height: `${blockHeight}px`,
                    backgroundColor: `hsl(${(tower.length * 30) % 360}, 70%, 60%)`,
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                  }}
                />
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameOver' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {tower.length >= 20 ? '🎉 You Win!' : 'Game Over!'}
                    </h3>
                    <p className="text-subtle-text mb-6">
                      {tower.length >= 20 
                        ? 'You built a perfect tower!' 
                        : 'The block fell off!'}
                    </p>
                    <button
                      onClick={onStart}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {gameState === 'playing' && (
              <div className="text-center mt-6">
                <button
                  onClick={onDrop}
                  className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xl transition-colors duration-200 shadow-lg"
                >
                  DROP BLOCK (SPACE)
                </button>
                <p className="text-subtle-text text-sm mt-3">
                  Drop the block when it aligns perfectly for bonus points!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
