// A React component for a Sliding Puzzle game with a 4x4 grid.
import React, { useState, useEffect, useCallback } from 'react';
// API function to submit score
import { submitScore } from '../../../../../src/api/Api';
// Logger
import { logger, LogTags } from '../../../../../src/lib/logger';
// Components
import Instructions from '../../../../../src/components/shared/Instructions';
import Leaderboard from '../../../../../src/components/leaderboard/Leaderboard';
import PuzzleGrid from '../../../components/slidingpuzzle/PuzzleGrid';
import PuzzleStats from '../../../components/slidingpuzzle/PuzzleStats';
import PuzzleCompletedModal from '../../../components/slidingpuzzle/PuzzleCompletedModal';
import AnimatedBackground from '../../../../../src/components/AnimatedBackground';

// Constants
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// SlidingPuzzle component
export default function SlidingPuzzle(): JSX.Element {
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

    logger.info('Sliding Puzzle shuffled', {}, LogTags.WORD_GUESS);
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
      await submitScore('sliding-puzzle', finalScore);
      logger.info('Sliding Puzzle completed', { score: finalScore, moves, time: timeElapsed }, LogTags.WORD_GUESS);
    } catch (error) {
      logger.error('Failed to submit score', error, {}, LogTags.WORD_GUESS);
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
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sliding Puzzle</h1>
          <p className="text-subtle-text">Slide tiles to arrange them in numerical order!</p>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="sliding-puzzle" />
        </div>

        {/* Game Stats */}
        <PuzzleStats
          moves={moves}
          timeElapsed={timeElapsed}
          gameStarted={gameStarted}
          gameCompleted={gameCompleted}
        />

        {/* Game Grid */}
        <PuzzleGrid
          tiles={tiles}
          gridSize={GRID_SIZE}
          onTileClick={moveTile}
          isShuffling={isShuffling}
          gameCompleted={gameCompleted}
          onShuffle={shufflePuzzle}
          onReset={resetGame}
        />

        {/* Completion Modal */}
        {gameCompleted && (
          <PuzzleCompletedModal
            moves={moves}
            timeElapsed={timeElapsed}
            onPlayAgain={shufflePuzzle}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="sliding-puzzle" />
        </div>
      </div>
    </div>
  );
}