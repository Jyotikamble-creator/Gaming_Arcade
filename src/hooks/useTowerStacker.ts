// Custom hook for Tower Stacker game logic
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Tower, Block, GameStats } from '../types/towerStacker';
import { 
  GAME_CONFIG, 
  calculateOverlap, 
  isPerfectDrop, 
  calculateScore, 
  shouldIncreaseSpeed 
} from '../utils/towerStackerUtils';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

export interface UseTowerStackerReturn {
  gameState: GameState;
  tower: Tower;
  currentBlock: Block | null;
  direction: number;
  speed: number;
  score: number;
  level: number;
  perfectDrops: number;
  gameCompleted: boolean;
  highestLevel: number;
  startGame: () => void;
  dropBlock: () => void;
}

export function useTowerStacker(): UseTowerStackerReturn {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tower, setTower] = useState<Tower>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [direction, setDirection] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(GAME_CONFIG.INITIAL_SPEED);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [perfectDrops, setPerfectDrops] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [highestLevel, setHighestLevel] = useState<number>(0);

  const animationRef = useRef<number | null>(null);

  // Start new game
  const startGame = useCallback((): void => {
    const initialBlock: Block = {
      x: GAME_CONFIG.CONTAINER_WIDTH / 2 - GAME_CONFIG.INITIAL_WIDTH / 2,
      width: GAME_CONFIG.INITIAL_WIDTH,
      y: 0,
    };

    setTower([initialBlock]);
    setCurrentBlock({
      x: 0,
      width: GAME_CONFIG.INITIAL_WIDTH,
      y: GAME_CONFIG.BLOCK_HEIGHT,
    });
    setDirection(1);
    setSpeed(GAME_CONFIG.INITIAL_SPEED);
    setScore(0);
    setLevel(1);
    setPerfectDrops(0);
    setGameState('playing');
    setGameCompleted(false);

    logger.info('Tower Stacker game started', {}, LogTags.WORD_GUESS);
  }, []);

  // Animation loop for moving block
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    const animate = (): void => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        let newX = prev.x + speed * direction;
        let newDirection = direction;

        // Bounce off walls
        if (newX <= 0) {
          newX = 0;
          newDirection = 1;
        } else if (newX + prev.width >= GAME_CONFIG.CONTAINER_WIDTH) {
          newX = GAME_CONFIG.CONTAINER_WIDTH - prev.width;
          newDirection = -1;
        }

        setDirection(newDirection);

        return { ...prev, x: newX };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBlock, speed, direction]);

  // Drop block
  const dropBlock = useCallback((): void => {
    if (gameState !== 'playing' || !currentBlock) return;

    const lastBlock = tower[tower.length - 1];
    const overlap = calculateOverlap(currentBlock, lastBlock);

    if (overlap <= 0) {
      // Game over - no overlap
      endGame();
      return;
    }

    // Calculate new block dimensions based on overlap
    const overlapStart = Math.max(currentBlock.x, lastBlock.x);
    const newBlock: Block = {
      x: overlapStart,
      width: overlap,
      y: tower.length * GAME_CONFIG.BLOCK_HEIGHT,
    };

    // Check for perfect drop
    const isPerfect = isPerfectDrop(currentBlock, lastBlock);
    if (isPerfect) {
      setPerfectDrops(prev => prev + 1);
    }

    // Calculate score
    const newScore = calculateScore(score, isPerfect, perfectDrops);

    setTower([...tower, newBlock]);
    setScore(newScore);
    setLevel(tower.length + 1);

    // Increase speed every 5 levels
    if (shouldIncreaseSpeed(tower.length)) {
      setSpeed(prev => prev + GAME_CONFIG.SPEED_INCREMENT);
    }

    // Check for win condition
    if (tower.length >= GAME_CONFIG.MAX_LEVELS - 1) {
      completeGame(newScore, GAME_CONFIG.MAX_LEVELS);
      return;
    }

    // Set next block
    setCurrentBlock({
      x: 0,
      width: overlap,
      y: (tower.length + 1) * GAME_CONFIG.BLOCK_HEIGHT,
    });

    if (!isPerfect) {
      setPerfectDrops(0);
    }
  }, [gameState, currentBlock, tower, score, perfectDrops]);

  // End game
  const endGame = useCallback((): void => {
    setGameState('gameOver');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (level > highestLevel) {
      setHighestLevel(level);
    }

    completeGame(score, level);
  }, [level, highestLevel, score]);

  // Complete game and submit score
  const completeGame = useCallback(async (finalScore: number, finalLevel: number): Promise<void> => {
    setGameCompleted(true);
    setGameState('gameOver');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      await submitScore(GAME_CONFIG.GAME_NAME, finalScore);
      logger.info('Tower Stacker score submitted', { score: finalScore, level: finalLevel }, LogTags.WORD_GUESS);
    } catch (error) {
      logger.error('Failed to submit score', error, {}, LogTags.WORD_GUESS);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        dropBlock();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, dropBlock]);

  return {
    gameState,
    tower,
    currentBlock,
    direction,
    speed,
    score,
    level,
    perfectDrops,
    gameCompleted,
    highestLevel,
    startGame,
    dropBlock
  };
}