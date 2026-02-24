'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Position {
  row: number;
  col: number;
}

interface GameBoardProps {
  board: number[][];
  newTiles?: Position[];
  mergedTiles?: Position[];
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  newTiles = [], 
  mergedTiles = [] 
}) => {
  const getTileStyle = (value: number): string => {
    const styles: { [key: number]: string } = {
      0: 'bg-gray-700/50',
      2: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
      4: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
      8: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
      16: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
      32: 'bg-gradient-to-br from-red-400 to-red-600 text-white',
      64: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
      128: 'bg-gradient-to-br from-pink-400 to-pink-600 text-white text-sm',
      256: 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-sm',
      512: 'bg-gradient-to-br from-teal-400 to-teal-600 text-white text-sm',
      1024: 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-xs',
      2048: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black text-xs font-bold'
    };
    
    return styles[value] || 'bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xs';
  };

  const isNewTile = (row: number, col: number): boolean => {
    return newTiles.some(tile => tile.row === row && tile.col === col);
  };

  const isMergedTile = (row: number, col: number): boolean => {
    return mergedTiles.some(tile => tile.row === row && tile.col === col);
  };

  return (
    <div className="inline-block p-4 bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-2xl">
      <div className="grid grid-cols-4 gap-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-16 h-16 rounded-lg flex items-center justify-center
                font-bold text-lg transition-all duration-200
                ${getTileStyle(cell)}
                ${cell === 0 ? 'text-transparent' : ''}
              `}
              initial={isNewTile(rowIndex, colIndex) ? { scale: 0 } : false}
              animate={{
                scale: isMergedTile(rowIndex, colIndex) ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {cell !== 0 && (
                <span className="drop-shadow-lg">
                  {cell}
                </span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;