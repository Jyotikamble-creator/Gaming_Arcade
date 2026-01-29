// Custom hook for Tower Stacker game logic
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, 
  Tower, 
  Block, 
  GameStats, 
  TowerStackerHookReturn 
} from '@/types/games/tower-stacker';
import { 
  GAME_CONFIG, 
  calculateOverlap, 
  isPerfectDrop, 
  calculateScore, 
  shouldIncreaseSpeed,
  getBlockColor 
} from '@/utility/games/tower-stacker';

export function useTowerStacker(): TowerStackerHookReturn {
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

  // Drop block function
  const dropBlock = useCallback((): void => {
    if (!currentBlock || gameState !== 'playing') return;

    const previousBlock = tower[tower.length - 1];
    const overlap = calculateOverlap(currentBlock, previousBlock);
    
    if (overlap <= 0) {
      // Game over - no overlap
      setGameState('gameOver');
      setHighestLevel(prev => Math.max(prev, level));
      return;
    }

    const perfect = isPerfectDrop(currentBlock, previousBlock);
    const newWidth = overlap;
    const newScore = calculateScore(level, perfect, perfect ? perfectDrops : 0);

    // Create the dropped block
    const droppedBlock: Block = {
      x: Math.max(currentBlock.x, previousBlock.x),
      width: newWidth,
      y: tower.length * GAME_CONFIG.BLOCK_HEIGHT,
    };

    // Update game state
    setTower(prev => [...prev, droppedBlock]);
    setScore(prev => prev + newScore);
    
    if (perfect) {
      setPerfectDrops(prev => prev + 1);
    }

    // Check if game is complete
    if (level >= GAME_CONFIG.MAX_LEVELS) {
      setGameCompleted(true);
      setGameState('gameOver');
      setHighestLevel(prev => Math.max(prev, level));
      return;
    }

    // Prepare next level
    const nextLevel = level + 1;
    setLevel(nextLevel);

    // Increase speed if needed
    if (shouldIncreaseSpeed(nextLevel)) {
      setSpeed(prev => prev + GAME_CONFIG.SPEED_INCREMENT);
    }

    // Create next block
    setCurrentBlock({
      x: 0,
      width: newWidth,
      y: nextLevel * GAME_CONFIG.BLOCK_HEIGHT,
    });
  }, [currentBlock, gameState, tower, level, perfectDrops]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && gameState === 'playing') {
        event.preventDefault();
        dropBlock();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dropBlock, gameState]);

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