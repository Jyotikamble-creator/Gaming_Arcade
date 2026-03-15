"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinesweeper } from '@/hooks/games/useMinesweeper';
import type { MinesweeperDifficulty, MinesweeperMoveData } from '@/types/games/minesweeper';
import MinesweeperBoard from './MinesweeperBoard';
import MinesweeperControls from './MinesweeperControls';
import MinesweeperStats from './MinesweeperStats';
import { formatMinesweeperTime } from '@/utility/games/minesweeper';

const Minesweeper: React.FC = () => {
  const {
    game,
    isLoading,
    error,
    gameTime,
    startNewGame,
    makeMove,
    resetGame
  } = useMinesweeper();

  const [selectedDifficulty, setSelectedDifficulty] = useState<MinesweeperDifficulty>('beginner');

  // Start game on mount
  useEffect(() => {
    startNewGame(selectedDifficulty);
  }, []);

  const handleDifficultyChange = (difficulty: MinesweeperDifficulty) => {
    setSelectedDifficulty(difficulty);
    startNewGame(difficulty);
  };

  const handleCellClick = (row: number, col: number, isRightClick: boolean = false) => {
    if (!game) return;

    let move: MinesweeperMoveData;

    if (isRightClick) {
      // Right click cycles: hidden -> flagged -> questioned -> hidden
      const cell = game.board[row][col];
      if (!cell.isRevealed) {
        if (!cell.isFlagged && !cell.isQuestioned) {
          move = { row, col, move: 'flag' };
        } else if (cell.isFlagged) {
          move = { row, col, move: 'unflag' };
          // Then question
          makeMove(move);
          move = { row, col, move: 'question' };
        } else if (cell.isQuestioned) {
          move = { row, col, move: 'unquestion' };
        } else {
          return; // Should not reach here
        }
      } else {
        return; // Can't flag revealed cells
      }
    } else {
      // Left click reveals
      move = { row, col, move: 'reveal' };
    }

    makeMove(move);
  };

  const getStatusMessage = () => {
    if (!game) return 'Loading...';

    switch (game.status) {
      case 'ready':
        return 'Click any cell to start!';
      case 'playing':
        return `Playing - ${game.minesRemaining} mines remaining`;
      case 'won':
        return `🎉 You won in ${formatMinesweeperTime(gameTime)}!`;
      case 'lost':
        return '💣 Game Over - You hit a mine!';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    if (!game) return 'text-gray-600';

    switch (game.status) {
      case 'ready':
        return 'text-blue-600';
      case 'playing':
        return 'text-green-600';
      case 'won':
        return 'text-yellow-600';
      case 'lost':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">💣</div>
          <div className="text-white text-xl">Loading Minesweeper...</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-red-900/20 p-8 rounded-lg border border-red-500/20"
        >
          <div className="text-red-400 text-xl mb-4">Error</div>
          <div className="text-white">{error}</div>
          <button
            onClick={() => startNewGame(selectedDifficulty)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            💣 Minesweeper
          </h1>
          <p className="text-white/70 text-lg">
            Find all the mines without detonating any!
          </p>
        </motion.div>

        {/* Game Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className={`text-xl font-semibold ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </motion.div>

        {/* Controls */}
        <MinesweeperControls
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          onReset={resetGame}
          gameStatus={game?.status || 'ready'}
        />

        {/* Game Board */}
        <AnimatePresence mode="wait">
          {game && (
            <motion.div
              key={game.gameId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center mb-8"
            >
              <MinesweeperBoard
                game={game}
                onCellClick={handleCellClick}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <MinesweeperStats
          gameTime={gameTime}
          game={game}
        />

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
        >
          <h3 className="text-white text-xl font-bold mb-4">How to Play</h3>
          <div className="text-white/80 space-y-2">
            <p><strong>Left Click:</strong> Reveal a cell</p>
            <p><strong>Right Click:</strong> Flag/unflag a cell (🚩)</p>
            <p><strong>Goal:</strong> Reveal all non-mine cells without clicking on mines</p>
            <p><strong>Numbers:</strong> Show how many mines are adjacent to that cell</p>
            <p><strong>Tip:</strong> Use numbers to deduce where mines are located</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Minesweeper;