// WhackMoleGrid component to render the game grid
import React from 'react';
import { WhackMoleGridProps } from '@/types/games/whack-a-mole';

export default function WhackMoleGrid({ 
  grid, 
  active, 
  gameStarted, 
  gameEnded, 
  onWhack 
}: WhackMoleGridProps): JSX.Element {
  const gridCols = Math.ceil(Math.sqrt(grid.length));
  
  return (
    <div className="bg-green-800/30 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
      <div 
        className="grid gap-3 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {grid.map((hole) => (
          <button
            key={hole}
            onClick={() => onWhack(hole)}
            disabled={!gameStarted || gameEnded}
            className={`
              relative w-20 h-20 rounded-full border-4 border-brown-600 
              transition-all duration-150 transform
              ${!gameStarted || gameEnded 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-brown-500 hover:bg-brown-400 cursor-pointer hover:scale-105'
              }
              ${active === hole 
                ? 'bg-yellow-500 animate-bounce shadow-lg border-yellow-400' 
                : ''
              }
            `}
          >
            {/* Hole opening */}
            <div className="absolute inset-2 bg-black rounded-full shadow-inner">
              {/* Mole */}
              {active === hole && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl animate-ping">🐭</div>
                </div>
              )}
            </div>
            
            {/* Hit effect */}
            {active === hole && (
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
}