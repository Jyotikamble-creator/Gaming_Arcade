// A React component for a Sliding Puzzle game with a 4x4 grid.
"use client";

import React, { useState, useEffect, useCallback } from 'react';
// API function to submit score
import { submitScore } from '@/lib/api/client';
// Logger
import { logger } from '@/lib/logger';
// Components
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import PuzzleGrid from '@/components/games/slidingpuzzle/PuzzleGrid';
import PuzzleStats from '@/components/games/slidingpuzzle/PuzzleStats';
import PuzzleCompletedModal from '@/components/games/slidingpuzzle/PuzzleCompletedModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import DashboardLayout from '@/components/shared/DashboardLayout';

// Constants
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// SlidingPuzzle component
export default function SlidingPuzzle() {
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(TOTAL_TILES - 1);
  const [moves, setMoves] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Initialize solved puzzle
  const createSolvedPuzzle = useCallback((): (number | null)[] => {
    const solved: (number | null)[] = [];
    for (let i = 1; i < TOTAL_TILES; i++) {
      solved.push(i);
    }
    solved.push(null); // Empty space
    return solved;
  }, []);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback((currentTiles: (number | null)[]): boolean => {
    for (let i = 0; i < TOTAL_TILES - 1; i++) {
      if (currentTiles[i] !== i + 1) {
        return false;
      }
    }
    return currentTiles[TOTAL_TILES - 1] === null;
  }, []);

  // Shuffle the puzzle (ensure it's solvable)
  const shufflePuzzle = useCallback((): void => {
    setIsShuffling(true);
    const solved = createSolvedPuzzle();
    let shuffled = [...solved];
    let currentEmptyIndex = TOTAL_TILES - 1;

    // Perform random valid moves
    for (let i = 0; i < 1000; i++) {
      const validMoves = getValidMoves(currentEmptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

      // Swap tiles
      [shuffled[currentEmptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[currentEmptyIndex]];
      currentEmptyIndex = randomMove;
    }

    setTiles(shuffled);
    setEmptyIndex(currentEmptyIndex);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameCompleted(false);

    setTimeout(() => setIsShuffling(false), 500);

    logger.info('Sliding Puzzle shuffled', {});
  }, [createSolvedPuzzle]);

  // Get valid moves for empty space
  const getValidMoves = useCallback((emptyIdx: number): number[] => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIdx / GRID_SIZE);
    const col = emptyIdx % GRID_SIZE;

    // Check all four directions
    const directions = [
      { dr: -1, dc: 0 }, // Up
      { dr: 1, dc: 0 },  // Down
      { dr: 0, dc: -1 }, // Left
      { dr: 0, dc: 1 }   // Right
    ];

    for (const { dr, dc } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        validMoves.push(newRow * GRID_SIZE + newCol);
      }
    }

    return validMoves;
  }, []);

  // Move tile
  const moveTile = useCallback((tileIndex: number): void => {
    if (isShuffling || gameCompleted || !gameStarted) return;

    const validMoves = getValidMoves(emptyIndex);
    if (!validMoves.includes(tileIndex)) return;

    // Swap tiles
    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[tileIndex]] = [newTiles[tileIndex], newTiles[emptyIndex]];

    setTiles(newTiles);
    setEmptyIndex(tileIndex);
    setMoves(prev => prev + 1);

    // Check win condition
    if (isPuzzleSolved(newTiles)) {
      completeGame();
    }
  }, [tiles, emptyIndex, isShuffling, gameCompleted, gameStarted, getValidMoves, isPuzzleSolved]);

  // Complete game
  const completeGame = useCallback(async (): Promise<void> => {
    setGameCompleted(true);
    setGameStarted(false);

    // Calculate score based on moves and time
    const baseScore = 1000;
    const movePenalty = moves * 2;
    const timeBonus = Math.max(0, 300 - timeElapsed); // Bonus for quick completion
    const finalScore = Math.max(100, baseScore - movePenalty + timeBonus);

    try {
      await submitScore({ game: 'sliding-puzzle', score: finalScore });
      logger.info('Sliding Puzzle completed', { score: finalScore, moves, time: timeElapsed });
    } catch (error) {
      logger.error('Sliding Puzzle', 'Failed to submit score', { error: error instanceof Error ? error.message : String(error) });
    }
  }, [moves, timeElapsed]);

  // Reset game
  const resetGame = useCallback((): void => {
    setTiles(createSolvedPuzzle());
    setEmptyIndex(TOTAL_TILES - 1);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
  }, [createSolvedPuzzle]);

  // Initialize on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Render
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Sliding Puzzle</h1>
            <p className="text-white/70 text-lg">Slide tiles to arrange them in numerical order!</p>
          </div>

          {/* Main Game Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Game Grid - Left side (2 columns) */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-white font-semibold mb-6">Game Board</h2>
                <div className="flex justify-center">
                  <PuzzleGrid
                    tiles={tiles}
                    gridSize={GRID_SIZE}
                    onTileClick={moveTile}
                    isShuffling={isShuffling}
                    gameCompleted={gameCompleted}
                    onShuffle={shufflePuzzle}
                    onReset={resetGame}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Stats */}
            <div className="space-y-6">
              {/* Moves Card */}
              <div className="bg-linear-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-4 border border-blue-400/30">
                <h3 className="text-white/70 text-sm font-medium mb-2">Moves</h3>
                <p className="text-3xl font-bold text-blue-300">{moves}</p>
              </div>

              {/* Time Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-white/70 text-sm font-medium mb-2">Time</h3>
                <p className="text-2xl font-bold text-white font-mono">
                  {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
                </p>
              </div>

              {/* Status Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-white/70 text-sm font-medium mb-2">Status</h3>
                <p className="text-lg font-bold">
                  {gameCompleted ? (
                    <span className="text-green-400">✅ Solved!</span>
                  ) : gameStarted ? (
                    <span className="text-yellow-400">⏱️ Playing</span>
                  ) : (
                    <span className="text-gray-400">⏸️ Ready</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={shufflePuzzle}
                  disabled={isShuffling}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {isShuffling ? '🔀 Shuffling...' : '🎲 New Game'}
                </button>
                <button
                  onClick={resetGame}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-white font-semibold mb-4">📖 How to Play</h2>
            <Instructions gameType="sliding-puzzle" />
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-semibold mb-6">🏆 Leaderboard</h2>
            <Leaderboard gameType="sliding-puzzle" />
          </div>

          {/* Completion Modal */}
          {gameCompleted && (
            <PuzzleCompletedModal
              moves={moves}
              timeElapsed={timeElapsed}
              onPlayAgain={shufflePuzzle}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}