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
  generateRandomMole,
  calculateFinalScore,
  validateGameConfig,
  generateGrid,
  isValidHit 
} from '@/utility/games/whack-a-mole';

export const useWhackMole = (): WhackMoleHookReturn => {
  // Game state
  const [gameState, setGameState] = useState<WhackMoleGameState>({
    grid: generateGrid(WHACK_MOLE_CONFIG.gridSize),
    activeMole: null,
    score: 0,
    timeLeft: WHACK_MOLE_CONFIG.duration,
    gameStarted: false,
    gameEnded: false,
    isLoading: false
  });

  // Game statistics
  const [molesHit, setMolesHit] = useState<number>(0);
  const [totalMoles, setTotalMoles] = useState<number>(0);
  const [config, setConfig] = useState<WhackMoleConfig>(WHACK_MOLE_CONFIG);

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
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call to get game configuration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newConfig = validateGameConfig({
        gridSize: 9,
        duration: 30,
        moleInterval: 800,
        pointsPerHit: 10
      });
      
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
    } catch (error) {
      console.error('Failed to initialize whack-a-mole game:', error);
      // Use default config on error
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Start game function
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true, gameEnded: false }));
    
    // Start mole spawning timer
    moleTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.gameStarted && !prev.gameEnded) {
          const newActiveMole = generateRandomMole(config.gridSize, prev.activeMole || undefined);
          setTotalMoles(count => count + 1);
          return { ...prev, activeMole: newActiveMole };
        }
        return prev;
      });
    }, config.moleInterval);

    // Start game countdown timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          endGame();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [config]);

  // Whack mole function
  const whackMole = useCallback((index: number) => {
    setGameState(prev => {
      if (isValidHit(index, prev.activeMole, prev.gameStarted && !prev.gameEnded)) {
        setMolesHit(count => count + 1);
        return {
          ...prev,
          score: prev.score + config.pointsPerHit,
          activeMole: null
        };
      }
      return prev;
    });
  }, [config.pointsPerHit]);

  // End game function
  const endGame = useCallback(async () => {
    cleanup();
    setGameState(prev => ({ 
      ...prev, 
      gameEnded: true, 
      gameStarted: false, 
      activeMole: null 
    }));

    try {
      // Submit score to API
      const finalScore = calculateFinalScore(molesHit, calculateAccuracy(molesHit, totalMoles));
      console.log('Game ended with score:', finalScore);
      
      // TODO: Implement actual API call
      // await submitScore({
      //   game: 'whack-a-mole',
      //   score: finalScore,
      //   meta: { 
      //     molesHit, 
      //     totalMoles, 
      //     accuracy: calculateAccuracy(molesHit, totalMoles),
      //     duration: config.duration - gameState.timeLeft 
      //   }
      // });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [molesHit, totalMoles, config.duration, gameState.timeLeft]);

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

  return {
    gameState,
    stats,
    config,
    startGame,
    whackMole,
    restartGame,
    endGame
  };
};