"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { MinesweeperGame } from '@/types/games/minesweeper';
import { getCellDisplayValue, getCellColorClass } from '@/utility/games/minesweeper';

interface MinesweeperBoardProps {
  game: MinesweeperGame;
  onCellClick: (row: number, col: number, isRightClick?: boolean) => void;
}

const MinesweeperBoard: React.FC<MinesweeperBoardProps> = ({ game, onCellClick }) => {
  const { board } = game;

  const handleCellClick = (row: number, col: number, event: React.MouseEvent) => {
    event.preventDefault();

    if (event.type === 'contextmenu' || event.button === 2) {
      onCellClick(row, col, true); // Right click
    } else {
      onCellClick(row, col, false); // Left click
    }
  };

  const handleCellMouseDown = (event: React.MouseEvent) => {
    // Prevent context menu on right click
    if (event.button === 2) {
      event.preventDefault();
    }
  };

  return (
    <div className="inline-block p-4 bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-600">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${board[0]?.length || 9}, 1fr)`,
          maxWidth: '90vw',
          maxHeight: '70vh',
          overflow: 'auto'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: (rowIndex * row.length + colIndex) * 0.002,
                type: "spring",
                stiffness: 200
              }}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
                ${getCellColorClass(cell)}
                border border-gray-600 rounded
                flex items-center justify-center
                text-sm sm:text-base md:text-lg font-bold
                select-none cursor-pointer
                transition-all duration-150
                hover:scale-105 active:scale-95
                ${cell.isRevealed ? 'shadow-inner' : 'shadow-lg hover:shadow-xl'}
                ${cell.isMine && cell.isRevealed ? 'bg-red-600 animate-pulse' : ''}
              `}
              onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
              onContextMenu={(e) => handleCellClick(rowIndex, colIndex, e)}
              onMouseDown={handleCellMouseDown}
              disabled={game.status === 'won' || game.status === 'lost'}
            >
              <span className={`
                ${cell.isRevealed && cell.neighborMines > 0 ? 'text-black' : 'text-white'}
                ${cell.isMine && cell.isRevealed ? 'text-white' : ''}
                ${cell.isFlagged ? 'text-red-600' : ''}
                ${cell.isQuestioned ? 'text-yellow-600' : ''}
                drop-shadow-sm
              `}>
                {getCellDisplayValue(cell)}
              </span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default MinesweeperBoard;