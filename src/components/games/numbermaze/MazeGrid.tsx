'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MazeGridProps {
  grid: number[][];
  playerPos: [number, number];
  visited: Set<string>;
  isGenerating: boolean;
  onMove: (direction: [-1, 0] | [1, 0] | [0, -1] | [0, 1]) => void;
  onReset: () => void;
  className?: string;
}

const MazeGrid: React.FC<MazeGridProps> = ({
  grid,
  playerPos,
  visited,
  isGenerating,
  onMove,
  onReset,
  className
}) => {
  const [playerRow, playerCol] = playerPos;

  const getCellStyle = (row: number, col: number, value: number): string => {
    const isPlayer = row === playerRow && col === playerCol;
    const isVisited = visited.has(`${row},${col}`);
    const isStart = row === 0 && col === 0;

    if (isPlayer) {
      return 'bg-blue-500 text-white shadow-lg border-2 border-blue-300';
    }

    if (isVisited) {
      return 'bg-green-600 text-white shadow-md';
    }

    if (isStart) {
      return 'bg-slate-600 text-white';
    }

    // Color based on value
    if (value > 0) {
      return 'bg-emerald-500 text-white hover:bg-emerald-400 transition-colors';
    } else if (value < 0) {
      return 'bg-red-500 text-white hover:bg-red-400 transition-colors';
    } else {
      return 'bg-slate-500 text-white';
    }
  };

  const isValidMove = (row: number, col: number): boolean => {
    const [currentRow, currentCol] = playerPos;
    const rowDiff = Math.abs(row - currentRow);
    const colDiff = Math.abs(col - currentCol);
    
    // Can only move to adjacent cells (not diagonal)
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    const isNotVisited = !visited.has(`${row},${col}`);
    
    return isAdjacent && isNotVisited;
  };

  const handleCellClick = (row: number, col: number) => {
    if (isGenerating || !isValidMove(row, col)) return;

    const [currentRow, currentCol] = playerPos;
    const direction: [-1, 0] | [1, 0] | [0, -1] | [0, 1] = [
      row - currentRow,
      col - currentCol
    ] as any;
    
    onMove(direction);
  };

  if (!grid.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading maze...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ''}`}>
      {/* Game Grid */}
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-6 border border-slate-700 shadow-2xl">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {grid.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const isPlayer = rowIndex === playerRow && colIndex === playerCol;
              const canMove = isValidMove(rowIndex, colIndex);
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-16 h-16 flex items-center justify-center rounded-lg font-bold text-lg cursor-pointer relative
                    ${getCellStyle(rowIndex, colIndex, value)}
                    ${canMove ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  whileHover={canMove ? { scale: 1.1 } : {}}
                  whileTap={canMove ? { scale: 0.95 } : {}}
                  animate={isPlayer ? { 
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 10px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                  } : {}}
                  transition={{ duration: 0.6, repeat: isPlayer ? Infinity : 0 }}
                >
                  {isPlayer ? '👤' : value}
                  
                  {/* Valid move indicator */}
                  {canMove && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Grid Legend */}
        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Player</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Negative</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col items-center gap-4">
        {/* Directional Controls */}
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => onMove([-1, 0])}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <ArrowUp size={20} />
          </button>
          <div></div>
          
          <button
            onClick={() => onMove([0, -1])}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <ArrowLeft size={20} />
          </button>
          <div></div>
          <button
            onClick={() => onMove([0, 1])}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <ArrowRight size={20} />
          </button>
          
          <div></div>
          <button
            onClick={() => onMove([1, 0])}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <ArrowDown size={20} />
          </button>
          <div></div>
        </div>

        {/* New Maze Button */}
        <button
          onClick={onReset}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Generating...' : 'New Maze'}
        </button>
      </div>
    </div>
  );
};

export default MazeGrid;