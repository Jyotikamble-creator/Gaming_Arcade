// WhackMoleGrid component to render the game grid
import React from 'react';
import { WhackMoleGridProps } from '@/types/games/whack-a-mole';

const WhackMoleGrid: React.FC<WhackMoleGridProps> = ({ 
  grid, 
  active, 
  gameStarted, 
  gameEnded, 
  onWhack 
}) => {
  const gridCols = Math.ceil(Math.sqrt(grid.length));
  
  return (
    <div className="bg-green-800/30 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl max-w-md mx-auto">
      <div 
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {grid.map((hole, index) => (
          <button
            key={index}
            onClick={() => onWhack(index)}
            disabled={!gameStarted || gameEnded}
            className={`
              relative w-20 h-20 rounded-full border-4 border-amber-900
              transition-all duration-150 transform
              ${!gameStarted || gameEnded 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-amber-700 hover:bg-amber-600 cursor-pointer hover:scale-105'
              }
              ${active === index 
                ? 'bg-yellow-500 animate-bounce shadow-lg border-yellow-400' 
                : ''
              }
            `}
          >
            {/* Hole opening */}
            <div className="absolute inset-2 bg-black rounded-full shadow-inner">
              {/* Mole */}
              {active === index && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl animate-ping">🐭</div>
                </div>
              )}
            </div>
            
            {/* Hit effect */}
            {active === index && (
              <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-50 animate-pulse" />
            )}
          </button>
        ))}
      </div>
      
      {/* Game instructions */}
      <div className="text-center mt-6">
        <p className="text-gray-300 text-sm">
          {!gameStarted && !gameEnded && 'Click "Start Game" to begin!'}
          {gameStarted && !gameEnded && 'Click the moles as quickly as you can! 🔨'}
          {gameEnded && 'Game Over! Click "Play Again" to restart.'}
        </p>
      </div>
    </div>
  );
};

export default WhackMoleGrid;
