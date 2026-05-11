// A React component for a Sliding Puzzle game with difficulty levels
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
// Components
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import PuzzleGrid from '@/components/games/slidingpuzzle/PuzzleGrid';
import PuzzleStats from '@/components/games/slidingpuzzle/PuzzleStats';
import PuzzleCompletedModal from '@/components/games/slidingpuzzle/PuzzleCompletedModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { logger } from '@/lib/logger';

// Difficulty configuration
interface DifficultyConfig {
  gridSize: number;
  shuffles: number;
  scoreMultiplier: number;
  label: string;
  emoji: string;
  description: string;
}

const DIFFICULTY_SETTINGS: Record<'easy' | 'medium' | 'hard', DifficultyConfig> = {
  easy: {
    gridSize: 3,
    shuffles: 200,
    scoreMultiplier: 1,
    label: 'Easy',
    emoji: '🌱',
    description: '3x3 grid with gentle shuffling'
  },
  medium: {
    gridSize: 4,
    shuffles: 500,
    scoreMultiplier: 2,
    label: 'Medium',
    emoji: '⚡',
    description: '4x4 grid with standard shuffling'
  },
  hard: {
    gridSize: 5,
    shuffles: 1000,
    scoreMultiplier: 3,
    label: 'Hard',
    emoji: '🔥',
    description: '5x5 grid with intense shuffling'
  }
};

// SlidingPuzzle component
export default function SlidingPuzzle() {
  const { user, loading } = useAuth();
    const router = useRouter();
    if (loading) {
      return (
        <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }

    if (!user) {
      router.push("/pages/auth");
      return null;
    }
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>(undefined);
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const gridSize = difficulty ? DIFFICULTY_SETTINGS[difficulty].gridSize : 4;
  const totalTiles = gridSize * gridSize;

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
  const createSolvedPuzzle = useCallback((size: number): (number | null)[] => {
    const solved: (number | null)[] = [];
    const total = size * size;
    for (let i = 1; i < total; i++) {
      solved.push(i);
    }
    solved.push(null); // Empty space
    return solved;
  }, []);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback((currentTiles: (number | null)[], size: number): boolean => {
    const total = size * size;
    for (let i = 0; i < total - 1; i++) {
      if (currentTiles[i] !== i + 1) {
        return false;
      }
    }
    return currentTiles[total - 1] === null;
  }, []);

  // Get valid moves for empty space
  const getValidMoves = useCallback((emptyIdx: number, size: number): number[] => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;

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
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        validMoves.push(newRow * size + newCol);
      }
    }

    return validMoves;
  }, []);

  // Shuffle the puzzle (ensure it's solvable)
  const shufflePuzzle = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard'): void => {
    setIsShuffling(true);
    const size = DIFFICULTY_SETTINGS[selectedDifficulty].gridSize;
    const shuffleCount = DIFFICULTY_SETTINGS[selectedDifficulty].shuffles;
    
    const solved = createSolvedPuzzle(size);
    let shuffled = [...solved];
    let currentEmptyIndex = size * size - 1;

    // Perform random valid moves
    for (let i = 0; i < shuffleCount; i++) {
      const validMoves = getValidMoves(currentEmptyIndex, size);
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

    logger.info('Sliding Puzzle shuffled', { difficulty: selectedDifficulty });
  }, [createSolvedPuzzle, getValidMoves]);

  // Move tile
  const moveTile = useCallback((tileIndex: number): void => {
    if (isShuffling || gameCompleted || !gameStarted || !difficulty) return;

    const validMoves = getValidMoves(emptyIndex, gridSize);
    if (!validMoves.includes(tileIndex)) return;

    // Swap tiles
    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[tileIndex]] = [newTiles[tileIndex], newTiles[emptyIndex]];

    setTiles(newTiles);
    setEmptyIndex(tileIndex);
    setMoves(prev => prev + 1);

    // Check win condition
    if (isPuzzleSolved(newTiles, gridSize)) {
      completeGame();
    }
  }, [tiles, emptyIndex, isShuffling, gameCompleted, gameStarted, difficulty, gridSize, getValidMoves, isPuzzleSolved]);

  // Submit score to API
  const submitScore = useCallback(async (finalScore: number) => {
    if (!user || !difficulty) return;

    try {
      const scoreData = {
        game: "sliding-puzzle",
        score: finalScore,
        meta: {
          difficulty,
          moves,
          time: timeElapsed,
          gridSize
        },
        player: user.displayName || user.name
      };

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit score: ${response.statusText}`);
      }

      console.log("[SLIDING_PUZZLE] Score submitted successfully");
    } catch (error) {
      console.error("[SLIDING_PUZZLE] Error submitting score:", error);
    }
  }, [user, difficulty, moves, timeElapsed, gridSize]);

  // Complete game
  const completeGame = useCallback((): void => {
    setGameCompleted(true);
    setGameStarted(false);

    if (!difficulty) return;

    // Calculate score based on moves and time
    const baseScore = 1000 - (moves * 5);
    const timeBonus = Math.max(0, 300 - timeElapsed);
    const finalScore = Math.round((baseScore + timeBonus) * DIFFICULTY_SETTINGS[difficulty].scoreMultiplier);

    submitScore(Math.max(100, finalScore));

    logger.info('Sliding Puzzle completed', { 
      score: finalScore, 
      moves, 
      time: timeElapsed, 
      difficulty 
    });
  }, [moves, timeElapsed, difficulty, submitScore]);

  // Reset game
  const resetGame = useCallback((): void => {
    if (!difficulty) return;
    setTiles(createSolvedPuzzle(gridSize));
    setEmptyIndex(totalTiles - 1);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
  }, [difficulty, gridSize, totalTiles, createSolvedPuzzle]);

  // Handle difficulty selection
  const handleDifficultySelect = (selectedDifficulty: 'easy' | 'medium' | 'hard'): void => {
    setDifficulty(selectedDifficulty);
    shufflePuzzle(selectedDifficulty);
  };

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
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
                  🎮 Sliding Puzzle
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Slide tiles to arrange them in order!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Easy */}
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 3x3 grid</li>
                      <li>✓ Gentle shuffling</li>
                      <li>✓ Points: 1x multiplier</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => handleDifficultySelect('medium')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 4x4 grid</li>
                      <li>✓ Standard shuffling</li>
                      <li>✓ Points: 2x multiplier</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => handleDifficultySelect('hard')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5x5 grid</li>
                      <li>✓ Intense shuffling</li>
                      <li>✓ Points: 3x multiplier</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>🔤 Click tiles to slide them</p>
                    <p>✅ Arrange numbers in order</p>
                  </div>
                  <div className="space-y-2">
                    <p>⏱️ Complete as fast as possible</p>
                    <p>🏆 Minimize moves for high scores!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Game in progress
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Sliding Puzzle</h1>
            <div className="inline-block">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                {difficulty === 'easy' ? '🌱 Easy' : difficulty === 'medium' ? '⚡ Medium' : '🔥 Hard'}
              </span>
            </div>
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
                    gridSize={gridSize}
                    onTileClick={moveTile}
                    isShuffling={isShuffling}
                    gameCompleted={gameCompleted}
                    onShuffle={() => difficulty && shufflePuzzle(difficulty)}
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
                  ) : (
                    <span className="text-yellow-400">⏱️ Playing</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => difficulty && shufflePuzzle(difficulty)}
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
              difficulty={difficulty}
              onPlayAgain={() => difficulty && shufflePuzzle(difficulty)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}