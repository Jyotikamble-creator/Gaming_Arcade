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
  const [gameStarted, setGameStarted] = useState(false);

  const handleDifficultyChange = (difficulty: MinesweeperDifficulty) => {
    setSelectedDifficulty(difficulty);
    startNewGame(difficulty);
  };

  const handleDifficultySelect = (difficulty: MinesweeperDifficulty) => {
    setSelectedDifficulty(difficulty);
    startNewGame(difficulty);
    setGameStarted(true);
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

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                💣 Minesweeper
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Find all the mines without detonating any!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Beginner */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('beginner')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Beginner</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 9×9 Board</li>
                    <li>✓ 10 Mines</li>
                    <li>✓ 71 Safe Cells</li>
                  </ul>
                </div>
              </motion.button>

              {/* Intermediate */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('intermediate')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-3">Intermediate</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 16×16 Board</li>
                    <li>✓ 40 Mines</li>
                    <li>✓ 216 Safe Cells</li>
                  </ul>
                </div>
              </motion.button>

              {/* Expert */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('expert')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Expert</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 16×30 Board</li>
                    <li>✓ 99 Mines</li>
                    <li>✓ 381 Safe Cells</li>
                  </ul>
                </div>
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>🖱️ Left Click to reveal a cell</p>
                  <p>🚩 Right Click to flag a mine</p>
                </div>
                <div className="space-y-2">
                  <p>🔢 Numbers show adjacent mines</p>
                  <p>🎯 Reveal all non-mine cells to win</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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