import React, { useState, useEffect, useCallback } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import MazeGrid from '../components/numbermaze/MazeGrid';
import MazeStats from '../components/numbermaze/MazeStats';
import MazeCompletedModal from '../components/numbermaze/MazeCompletedModal';

const GRID_SIZE = 5; // 5x5 grid for good challenge
const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
];

export default function NumberMaze() {
  const [grid, setGrid] = useState([]);
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [currentSum, setCurrentSum] = useState(0);
  const [targetNumber, setTargetNumber] = useState(0);
  const [visited, setVisited] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Generate a solvable maze
  const generateMaze = useCallback(() => {
    setIsGenerating(true);

    // Create grid with random positive/negative numbers
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        // Mix of positive and negative numbers, weighted towards smaller values
        const sign = Math.random() < 0.6 ? 1 : -1;
        const value = Math.floor(Math.random() * 15) + 1; // 1-15
        row.push(sign * value);
      }
      newGrid.push(row);
    }

    // Set start position (top-left) to 0 and mark as visited
    newGrid[0][0] = 0;
    const startPos = [0, 0];
    const visitedSet = new Set([`${startPos[0]},${startPos[1]}`]);

    // Generate a path that can reach a reasonable target
    let currentPos = [...startPos];
    let pathSum = 0;
    const path = [currentPos];

    // Create a path of 8-12 moves
    const pathLength = Math.floor(Math.random() * 5) + 8;

    for (let step = 0; step < pathLength; step++) {
      const possibleMoves = DIRECTIONS
        .map(([di, dj]) => [currentPos[0] + di, currentPos[1] + dj])
        .filter(([i, j]) =>
          i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE &&
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

    // Set target as a reasonable number (between -50 and 100)
    const target = Math.floor(Math.random() * 151) - 50;
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

    logger.info('Number Maze generated', {
      gridSize: GRID_SIZE,
      target,
      startSum: 0
    }, LogTags.GAMES);
  }, []);

  // Initialize maze on mount
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Handle player movement
  const movePlayer = useCallback((direction) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const [di, dj] = direction;
    const [currentI, currentJ] = playerPos;
    const newI = currentI + di;
    const newJ = currentJ + dj;

    // Check bounds
    if (newI < 0 || newI >= GRID_SIZE || newJ < 0 || newJ >= GRID_SIZE) {
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
      submitScore('number-maze', calculateScore(moves + 1, timeElapsed + 1));
      logger.info('Number Maze completed', {
        moves: moves + 1,
        time: timeElapsed + 1,
        target: targetNumber,
        finalSum: newSum
      }, LogTags.GAMES);
    }
  }, [playerPos, grid, currentSum, targetNumber, visited, moves, timeElapsed, gameStarted]);

  // Calculate score based on efficiency
  const calculateScore = (finalMoves, finalTime) => {
    const baseScore = 1000;
    const movePenalty = Math.max(0, finalMoves - 10) * 10; // Penalty after 10 moves
    const timeBonus = Math.max(0, 300 - finalTime) * 2; // Bonus for speed
    const targetBonus = Math.abs(targetNumber) <= 25 ? 100 : 0; // Bonus for reasonable targets

    return Math.max(100, baseScore - movePenalty + timeBonus + targetBonus);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
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

  const resetGame = () => {
    generateMaze();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEfficiency = () => {
    if (moves === 0) return 100;
    // Efficiency based on how close we are to target vs moves taken
    const progress = Math.abs(currentSum) / Math.max(1, Math.abs(targetNumber));
    const efficiency = Math.max(0, 100 - (moves * 5) + (progress * 50));
    return Math.min(100, Math.max(0, efficiency));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Number Maze</h1>
          <p className="text-blue-200">Navigate the maze to reach the target number!</p>
        </div>

        {/* Instructions */}
        <Instructions gameType="number-maze" />

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
        <Leaderboard gameType="number-maze" />

        {/* Completion Modal */}
        {gameCompleted && (
          <MazeCompletedModal
            moves={moves}
            time={timeElapsed}
            score={calculateScore(moves, timeElapsed)}
            targetNumber={targetNumber}
            efficiency={getEfficiency()}
            onPlayAgain={resetGame}
          />
        )}
      </div>
    </div>
  );
}