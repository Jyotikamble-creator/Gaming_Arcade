import { useState, useEffect, useCallback, useRef } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

// Constants
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
const SHUFFLE_MOVES = 1000;
const SHUFFLE_ANIMATION_DELAY = 500;

/**
 * Custom hook for managing Sliding Puzzle game logic
 */
export const useSlidingPuzzle = () => {
  // Game state
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(TOTAL_TILES - 1);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Timer ref
  const timerRef = useRef(null);

  // Computed values
  const isGameActive = gameStarted && !gameCompleted;
  const canMoveTiles = gameStarted && !gameCompleted && !isShuffling;

  // Create solved puzzle configuration
  const createSolvedPuzzle = useCallback(() => {
    const solved = [];
    for (let i = 1; i < TOTAL_TILES; i++) {
      solved.push(i);
    }
    solved.push(null); // Empty space at the end
    return solved;
  }, []);

  // Check if current puzzle state is solved
  const isPuzzleSolved = useCallback((currentTiles) => {
    for (let i = 0; i < TOTAL_TILES - 1; i++) {
      if (currentTiles[i] !== i + 1) {
        return false;
      }
    }
    return currentTiles[TOTAL_TILES - 1] === null;
  }, []);

  // Get valid moves for the empty space
  const getValidMoves = useCallback((emptyIdx) => {
    const validMoves = [];
    const row = Math.floor(emptyIdx / GRID_SIZE);
    const col = emptyIdx % GRID_SIZE;

    // Check all four directions (up, down, left, right)
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

  // Shuffle puzzle with guaranteed solvable state
  const shufflePuzzle = useCallback(() => {
    setIsShuffling(true);
    const solved = createSolvedPuzzle();
    let shuffled = [...solved];
    let currentEmptyIndex = TOTAL_TILES - 1;

    // Perform random valid moves to ensure solvability
    for (let i = 0; i < SHUFFLE_MOVES; i++) {
      const validMoves = getValidMoves(currentEmptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

      // Swap tiles
      [shuffled[currentEmptyIndex], shuffled[randomMove]] = 
        [shuffled[randomMove], shuffled[currentEmptyIndex]];
      currentEmptyIndex = randomMove;
    }

    // Update game state
    setTiles(shuffled);
    setEmptyIndex(currentEmptyIndex);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameCompleted(false);

    // Remove shuffling animation after delay
    setTimeout(() => setIsShuffling(false), SHUFFLE_ANIMATION_DELAY);

    logger.info('Sliding Puzzle shuffled', { emptyIndex: currentEmptyIndex }, LogTags.WORD_GUESS);
  }, [createSolvedPuzzle, getValidMoves]);

  // Move a tile (if valid)
  const moveTile = useCallback((tileIndex) => {
    if (!canMoveTiles) return false;

    const validMoves = getValidMoves(emptyIndex);
    if (!validMoves.includes(tileIndex)) return false;

    // Perform the move
    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[tileIndex]] = 
      [newTiles[tileIndex], newTiles[emptyIndex]];

    setTiles(newTiles);
    setEmptyIndex(tileIndex);
    setMoves(prev => prev + 1);

    // Check for win condition
    if (isPuzzleSolved(newTiles)) {
      handleGameCompletion();
    }

    return true;
  }, [tiles, emptyIndex, canMoveTiles, getValidMoves, isPuzzleSolved]);

  // Handle game completion
  const handleGameCompletion = useCallback(async () => {
    setGameCompleted(true);
    setGameStarted(false);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate final score
    const score = calculateScore(moves, timeElapsed);

    try {
      await submitScore({
        game: 'sliding-puzzle',
        playerName: 'guest',
        score,
        meta: { moves, timeElapsed }
      });
      
      logger.info('Sliding Puzzle completed', { 
        score, 
        moves, 
        time: timeElapsed 
      }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit Sliding Puzzle score', error, {}, LogTags.SAVE_SCORE);
    }
  }, [moves, timeElapsed]);

  // Calculate score based on moves and time
  const calculateScore = useCallback((totalMoves, totalTime) => {
    const baseScore = 1000;
    const movePenalty = totalMoves * 2;
    const timeBonus = Math.max(0, 300 - totalTime); // Bonus for quick completion
    return Math.max(100, baseScore - movePenalty + timeBonus);
  }, []);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTiles(createSolvedPuzzle());
    setEmptyIndex(TOTAL_TILES - 1);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    setIsShuffling(false);

    logger.info('Sliding Puzzle reset', {}, LogTags.WORD_GUESS);
  }, [createSolvedPuzzle]);

  // Start new game (shuffle)
  const startNewGame = useCallback(() => {
    shufflePuzzle();
  }, [shufflePuzzle]);

  // Timer effect
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive]);

  // Initialize game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // Game state
    tiles,
    emptyIndex,
    moves,
    timeElapsed,
    gameStarted,
    gameCompleted,
    isShuffling,
    
    // Computed values
    isGameActive,
    canMoveTiles,
    gridSize: GRID_SIZE,
    
    // Actions
    moveTile,
    shufflePuzzle,
    resetGame,
    startNewGame,
    
    // Utilities
    getValidMoves,
    isPuzzleSolved
  };
};