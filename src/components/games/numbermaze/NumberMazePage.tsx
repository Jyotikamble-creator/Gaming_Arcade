'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import MazeGrid from './MazeGrid';
import MazeStats from './MazeStats';
import MazeCompletedModal from './MazeCompletedModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import { NumberMazeDifficulty, DIFFICULTY_CONFIG } from '@/types/games/number-maze';

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface NumberMazePageProps {
  user: User | null;
  onBackToDashboard?: () => void;
  className?: string;
}

type Direction = [-1, 0] | [1, 0] | [0, -1] | [0, 1];

// Constants
const DIRECTIONS: Direction[] = [
  [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
];

// API functions for number maze
async function submitScore(scoreData: { game: string; score: number; meta: Record<string, any> }): Promise<void> {
  try {
    const response = await fetch('/api/games/number-maze/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit score');
    }

    console.log('Score submitted successfully:', scoreData);
  } catch (error) {
    console.error('Error submitting score:', error);
  }
}

const NumberMazePage: React.FC<NumberMazePageProps> = ({ 
  user, 
  onBackToDashboard,
  className 
}) => {
  // Difficulty state
  const [difficulty, setDifficulty] = useState<NumberMazeDifficulty>('medium');
  const [difficultySelected, setDifficultySelected] = useState<boolean>(false);
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const gridSize = diffConfig.gridSize;

  // Game state
  const [grid, setGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [currentSum, setCurrentSum] = useState<number>(0);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Generate a solvable maze
  const generateMaze = useCallback(() => {
    setIsGenerating(true);

    // Create grid with random positive/negative numbers
    const newGrid: number[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; j++) {
        // Mix of positive and negative numbers, weighted towards smaller values
        const sign = Math.random() < 0.6 ? 1 : -1;
        const value = Math.floor(Math.random() * 15) + 1; // 1-15
        row.push(sign * value);
      }
      newGrid.push(row);
    }

    // Set start position (top-left) to 0 and mark as visited
    newGrid[0][0] = 0;
    const startPos: [number, number] = [0, 0];
    const visitedSet = new Set([`${startPos[0]},${startPos[1]}`]);

    // Generate a path that can reach a reasonable target
    let currentPos: [number, number] = [...startPos];
    let pathSum = 0;
    const path: [number, number][] = [currentPos];

    // Create a path based on difficulty
    const pathLength = Math.floor(Math.random() * (diffConfig.pathLength.max - diffConfig.pathLength.min + 1)) + diffConfig.pathLength.min;

    for (let step = 0; step < pathLength; step++) {
      const possibleMoves = DIRECTIONS
        .map(([di, dj]) => [currentPos[0] + di, currentPos[1] + dj] as [number, number])
        .filter(([i, j]) =>
          i >= 0 && i < gridSize && j >= 0 && j < gridSize &&
          !visitedSet.has(`${i},${j}`)
        );

      if (possibleMoves.length === 0) break;

      const nextPos = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const [ni, nj] = nextPos;

      // Adjust the value at this position to help reach target
      const currentValue = newGrid[ni][nj];
      pathSum += currentValue;

      visitedSet.add(`${ni},${nj}`);
      path.push(nextPos);
      currentPos = nextPos;
    }

    // Set target based on difficulty
    const { min, max } = diffConfig.targetRange;
    const target = Math.floor(Math.random() * (max - min + 1)) + min;
    // Adjust the last cell to make the target achievable
    const [lastI, lastJ] = path[path.length - 1];
    newGrid[lastI][lastJ] = target - pathSum;

    setGrid(newGrid);
    setPlayerPos(startPos);
    setCurrentSum(0);
    setTargetNumber(target);
    setVisited(visitedSet);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    setIsGenerating(false);

    console.log('[NUMBER_MAZE] Number Maze generated', {
      gridSize,
      target,
      startSum: 0
    });
  }, [gridSize, diffConfig.pathLength, diffConfig.targetRange]);

  // Initialize maze on mount
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Handle difficulty selection
  const handleDifficultySelect = (selectedDifficulty: NumberMazeDifficulty): void => {
    setDifficulty(selectedDifficulty);
    setDifficultySelected(true);
  };

  // Calculate score based on efficiency
  const calculateScore = (finalMoves: number, finalTime: number): number => {
    const baseScore = 1000;
    const movePenalty = Math.max(0, finalMoves - 10) * 10; // Penalty after 10 moves
    const timeBonus = Math.max(0, 300 - finalTime) * 2; // Bonus for speed
    const targetBonus = Math.abs(targetNumber) <= 25 ? 100 : 0; // Bonus for reasonable targets

    return Math.max(100, baseScore - movePenalty + timeBonus + targetBonus);
  };

  // Handle player movement
  const movePlayer = useCallback((direction: Direction) => {
    if (gameCompleted) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const [di, dj] = direction;
    const [currentI, currentJ] = playerPos;
    const newI = currentI + di;
    const newJ = currentJ + dj;

    // Check bounds
    if (newI < 0 || newI >= gridSize || newJ < 0 || newJ >= gridSize) {
      return;
    }

    // Check if already visited (can't revisit cells)
    const posKey = `${newI},${newJ}`;
    if (visited.has(posKey)) {
      return;
    }

    // Move player
    const newValue = grid[newI][newJ];
    const newSum = currentSum + newValue;
    const newVisited = new Set(visited);
    newVisited.add(posKey);

    setPlayerPos([newI, newJ]);
    setCurrentSum(newSum);
    setVisited(newVisited);
    setMoves(prev => prev + 1);

    // Check win condition
    if (newSum === targetNumber) {
      setGameCompleted(true);
      const finalScore = calculateScore(moves + 1, timeElapsed + 1);
      submitScore({
        game: 'number-maze',
        score: finalScore,
        meta: {
          moves: moves + 1,
          time: timeElapsed + 1,
          target: targetNumber,
          finalSum: newSum,
          gridSize: gridSize
        }
      });
      console.log('[NUMBER_MAZE] Number Maze completed', {
        moves: moves + 1,
        time: timeElapsed + 1,
        target: targetNumber,
        finalSum: newSum,
        score: finalScore
      });

      // Auto-load next maze after showing completion modal
      setTimeout(() => {
        generateMaze();
      }, 2000);
    }
  }, [playerPos, grid, currentSum, targetNumber, visited, moves, timeElapsed, gameStarted, gameCompleted]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameCompleted) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer([-1, 0]);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer([1, 0]);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer([0, -1]);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer([0, 1]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameCompleted]);

  const resetGame = (): void => {
    generateMaze();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEfficiency = (): number => {
    if (moves === 0) return 100;
    // Efficiency based on how close we are to target vs moves taken
    const progress = Math.abs(currentSum) / Math.max(1, Math.abs(targetNumber));
    const efficiency = Math.max(0, 100 - (moves * 5) + (progress * 50));
    return Math.min(100, Math.max(0, efficiency));
  };

  // Render loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Generating maze...</p>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (!difficultySelected) {
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
                🧩 Number Maze
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Navigate through the grid to reach the target number!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Easy */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('easy')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 4×4 Grid</li>
                    <li>✓ Short Paths</li>
                    <li>✓ Small Numbers</li>
                  </ul>
                </div>
              </motion.button>

              {/* Medium */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('medium')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 5×5 Grid</li>
                    <li>✓ Medium Paths</li>
                    <li>✓ Balanced Numbers</li>
                  </ul>
                </div>
              </motion.button>

              {/* Hard */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect('hard')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 6×6 Grid</li>
                    <li>✓ Long Paths</li>
                    <li>✓ Large Numbers</li>
                  </ul>
                </div>
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>⬅️➡️⬆️⬇️ Use arrow keys to move</p>
                  <p>🧮 Sum increases as you move</p>
                </div>
                <div className="space-y-2">
                  <p>🎯 Reach the target number</p>
                  <p>❌ Can't revisit cells</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the game
  return (
    <div className={`min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden ${className || ''}`}>
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="number-maze" />
        </div>

        {/* Game Stats */}
        <MazeStats
          currentSum={currentSum}
          targetNumber={targetNumber}
          moves={moves}
          time={formatTime(timeElapsed)}
          efficiency={getEfficiency()}
          gameStarted={gameStarted}
        />

        {/* Game Grid */}
        <div className="flex justify-center mb-6">
          <MazeGrid
            grid={grid}
            playerPos={playerPos}
            visited={visited}
            isGenerating={isGenerating}
            onMove={movePlayer}
            onReset={resetGame}
          />
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <Leaderboard gameType="number-maze" />
        </div>

        {/* Completion Modal */}
        {gameCompleted && (
          <MazeCompletedModal
            moves={moves}
            time={timeElapsed}
            score={calculateScore(moves, timeElapsed)}
            targetNumber={targetNumber}
            efficiency={getEfficiency()}
            onPlayAgain={resetGame}
            onBackToDashboard={onBackToDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default NumberMazePage;