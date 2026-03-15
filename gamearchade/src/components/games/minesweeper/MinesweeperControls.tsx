"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { MinesweeperDifficulty, GameStatus } from '@/types/games/minesweeper';
import { MINESWEEPER_CONFIGS } from '@/types/games/minesweeper';

interface MinesweeperControlsProps {
  selectedDifficulty: MinesweeperDifficulty;
  onDifficultyChange: (difficulty: MinesweeperDifficulty) => void;
  onReset: () => void;
  gameStatus: GameStatus;
}

const MinesweeperControls: React.FC<MinesweeperControlsProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  onReset,
  gameStatus
}) => {
  const difficulties: MinesweeperDifficulty[] = ['beginner', 'intermediate', 'expert'];

  const getDifficultyInfo = (difficulty: MinesweeperDifficulty) => {
    const config = MINESWEEPER_CONFIGS[difficulty];
    return `${config.rows}×${config.cols}, ${config.mines} mines`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
    >
      {/* Difficulty Selection */}
      <div className="flex gap-2">
        {difficulties.map((difficulty) => (
          <motion.button
            key={difficulty}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${selectedDifficulty === difficulty
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
              }
              border border-white/20 hover:border-white/40
            `}
            onClick={() => onDifficultyChange(difficulty)}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            <span className="block text-xs opacity-75">
              {getDifficultyInfo(difficulty)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          px-6 py-3 rounded-lg font-bold text-white
          bg-gradient-to-r from-green-600 to-green-700
          hover:from-green-700 hover:to-green-800
          shadow-lg hover:shadow-xl
          transition-all duration-200
          border border-green-500/20
        "
        onClick={onReset}
      >
        🔄 New Game
      </motion.button>

      {/* Game Status Indicator */}
      <div className="flex items-center gap-2 text-white/80">
        <div className={`
          w-3 h-3 rounded-full
          ${gameStatus === 'playing' ? 'bg-green-500 animate-pulse' :
            gameStatus === 'won' ? 'bg-yellow-500' :
            gameStatus === 'lost' ? 'bg-red-500' :
            'bg-blue-500'}
        `} />
        <span className="text-sm font-medium">
          {gameStatus === 'playing' ? 'Playing' :
           gameStatus === 'won' ? 'Won!' :
           gameStatus === 'lost' ? 'Lost' :
           'Ready'}
        </span>
      </div>
    </motion.div>
  );
};

export default MinesweeperControls;