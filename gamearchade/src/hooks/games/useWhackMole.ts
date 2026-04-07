// Custom hook for Whack-a-Mole game logic
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  WhackMoleGameState, 
  WhackMoleStats, 
  WhackMoleConfig,
  WhackMoleHookReturn,
  GameStatus 
} from '@/types/games/whack-a-mole';
import { 
  WHACK_MOLE_CONFIG,
  calculateAccuracy,
  generateGrid,
  isValidHit 
} from '@/utility/games/whack-a-mole';

export const useWhackMole = (): WhackMoleHookReturn => {
  // Game state
  const [gameState, setGameState] = useState<WhackMoleGameState>({
    grid: generateGrid(9),
    activeMole: null,
    score: 0,
    timeLeft: 30,
    gameStarted: false,
    gameEnded: false,
    isLoading: false
  });

  // Game statistics
  const [molesHit, setMolesHit] = useState<number>(0);
  const [totalMoles, setTotalMoles] = useState<number>(0);
  const [config, setConfig] = useState<WhackMoleConfig>({
    gridSize: 9,
    duration: 30,
    moleInterval: 800,
    pointsPerHit: 10
  });

  // Refs for timers
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    return cleanup;
  }, []);

  // Initialize game function
  const initializeGame = useCallback(async () => {
    const newConfig: WhackMoleConfig = {
      gridSize: 9,
      duration: 30,
      moleInterval: 800,
      pointsPerHit: 10
    };
    
    setConfig(newConfig);
    setGameState({
      grid: generateGrid(newConfig.gridSize),
      activeMole: null,
      score: 0,
      timeLeft: newConfig.duration,
      gameStarted: false,
      gameEnded: false,
      isLoading: false
    });
    setMolesHit(0);
    setTotalMoles(0);
  }, []);

  // Start game function
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true, gameEnded: false }));
    
    // Start mole spawning timer
    moleTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.gameStarted && !prev.gameEnded && prev.grid.length > 0) {
          // Spawn a random mole at a random grid index
          const randomIndex = Math.floor(Math.random() * prev.grid.length);
          setTotalMoles(count => count + 1);
          return { ...prev, activeMole: randomIndex };
        }
        return prev;
      });
    }, config.moleInterval || 1000);

    // Start game countdown timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          endGame();
          return { ...prev, timeLeft: 0, gameEnded: true, gameStarted: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [config]);

  // Whack mole function
  const whackMole = useCallback((index: number) => {
    setGameState(prev => {
      // Check if the clicked index matches the active mole and game is active
      if (isValidHit(index, prev.activeMole ?? -1) && prev.gameStarted && !prev.gameEnded && prev.activeMole !== null) {
        setMolesHit(count => count + 1);
        return {
          ...prev,
          score: prev.score + (config.pointsPerHit || 10),
          activeMole: null
        };
      }
      return prev;
    });
  }, [config.pointsPerHit]);

  // End game function
  const endGame = useCallback(() => {
    cleanup();
    setGameState(prev => ({ 
      ...prev, 
      gameEnded: true, 
      gameStarted: false, 
      activeMole: null 
    }));
  }, []);

  // Restart game function
  const restartGame = useCallback(async () => {
    cleanup();
    await initializeGame();
  }, [initializeGame]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (moleTimerRef.current) {
      clearInterval(moleTimerRef.current);
      moleTimerRef.current = null;
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  // Calculate current stats
  const stats: WhackMoleStats = {
    score: gameState.score,
    timeLeft: gameState.timeLeft,
    gameStatus: (gameState.gameEnded ? 'gameOver' : 
                 gameState.gameStarted ? 'playing' : 'ready') as GameStatus,
    molesHit,
    totalMoles,
    accuracy: calculateAccuracy(molesHit, totalMoles)
  };

  // Return hook values flattened for page component compatibility
  return {
    gameState,
    stats,
    config,
    startGame,
    whackMole,
    restartGame: restartGame as () => void,
    endGame,
    // Also include flattened stats for direct destructuring in page component
    score: gameState.score,
    timeLeft: gameState.timeLeft,
    molesHit,
    totalMoles,
    accuracy: calculateAccuracy(molesHit, totalMoles),
    isGameStarted: gameState.gameStarted,
    isGameOver: gameState.gameEnded,
    error: null,
    resetGame: restartGame as () => void
  } as any;
};