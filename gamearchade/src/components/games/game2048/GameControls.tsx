'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Direction = 'left' | 'right' | 'up' | 'down';

interface GameControlsProps {
  onMove: (direction: Direction) => void;
  onRestart: () => void;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onMove, 
  onRestart, 
  gameOver 
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Arrow Controls */}
      <div className="flex flex-col items-center gap-2">
        {/* Up Arrow */}
        <motion.button
          onClick={() => onMove('up')}
          disabled={gameOver}
          className="
            w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10
            rounded-lg flex items-center justify-center
            transition-colors duration-200 disabled:cursor-not-allowed
          "
          whileHover={!gameOver ? { scale: 1.1 } : {}}
          whileTap={!gameOver ? { scale: 0.95 } : {}}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
        
        {/* Left and Right Arrows */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => onMove('left')}
            disabled={gameOver}
            className="
              w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10
              rounded-lg flex items-center justify-center
              transition-colors duration-200 disabled:cursor-not-allowed
            "
            whileHover={!gameOver ? { scale: 1.1 } : {}}
            whileTap={!gameOver ? { scale: 0.95 } : {}}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={() => onMove('right')}
            disabled={gameOver}
            className="
              w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10
              rounded-lg flex items-center justify-center
              transition-colors duration-200 disabled:cursor-not-allowed
            "
            whileHover={!gameOver ? { scale: 1.1 } : {}}
            whileTap={!gameOver ? { scale: 0.95 } : {}}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
        
        {/* Down Arrow */}
        <motion.button
          onClick={() => onMove('down')}
          disabled={gameOver}
          className="
            w-12 h-12 bg-white/20 hover:bg-white/30 disabled:bg-white/10
            rounded-lg flex items-center justify-center
            transition-colors duration-200 disabled:cursor-not-allowed
          "
          whileHover={!gameOver ? { scale: 1.1 } : {}}
          whileTap={!gameOver ? { scale: 0.95 } : {}}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
      </div>
      
      {/* Restart Button */}
      <motion.button
        onClick={onRestart}
        className="
          px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
          text-white font-semibold rounded-lg shadow-lg
          hover:from-blue-600 hover:to-purple-700
          transition-all duration-200
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        New Game
      </motion.button>
      
      {/* Instructions */}
      <div className="text-white/60 text-sm text-center max-w-xs">
        Use arrow keys or click buttons to move tiles
      </div>
    </div>
  );
};

export default GameControls;