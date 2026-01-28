import { useState, useEffect, useRef } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

// Constants
const TOTAL_ROUNDS = 5;
const MIN_WAIT_TIME = 2000; // 2 seconds
const MAX_WAIT_TIME = 5000; // 5 seconds

/**
 * Custom hook for managing reaction time game logic
 */
export const useReactionTime = () => {
  // State
  const [gameState, setGameState] = useState('idle'); // idle, waiting, ready, clicked, completed
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [tooEarly, setTooEarly] = useState(false);
  const [averageTime, setAverageTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const timeoutRef = useRef(null);

  // Computed values
  const isGameActive = gameState !== 'idle' && !gameCompleted;
  const roundsRemaining = TOTAL_ROUNDS - currentRound;
  const progress = TOTAL_ROUNDS > 0 ? Math.round((currentRound / TOTAL_ROUNDS) * 100) : 0;

  // Performance rating calculation
  const getPerformanceRating = (avgTime) => {
    if (avgTime < 250) return { text: '🏆 Lightning Fast!', color: 'text-yellow-300' };
    if (avgTime < 300) return { text: '⚡ Excellent!', color: 'text-green-300' };
    if (avgTime < 350) return { text: '👍 Good!', color: 'text-blue-300' };
    if (avgTime < 400) return { text: '👌 Average', color: 'text-purple-300' };
    return { text: '💪 Keep Practicing!', color: 'text-orange-300' };
  };

  // Start the game
  const startGame = () => {
    setCurrentRound(0);
    setReactionTimes([]);
    setAverageTime(0);
    setBestTime(null);
    setGameCompleted(false);
    setTooEarly(false);
    setGameState('ready-to-start');

    logger.info('Reaction Time game started', {}, LogTags.WORD_GUESS);
  };

  // Start a new round
  const startRound = () => {
    setTooEarly(false);
    setGameState('waiting');

    // Random delay between MIN_WAIT_TIME and MAX_WAIT_TIME
    const waitTime = Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME) + MIN_WAIT_TIME;

    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, waitTime);
  };

  // Handle click during game
  const handleClick = () => {
    if (gameState === 'waiting') {
      // Clicked too early
      handleEarlyClick();
      return;
    }

    if (gameState === 'ready') {
      // Valid click - calculate reaction time
      handleValidClick();
    }
  };

  // Handle early click (during waiting phase)
  const handleEarlyClick = () => {
    setTooEarly(true);
    setGameState('idle');
    clearTimeout(timeoutRef.current);

    setTimeout(() => {
      setTooEarly(false);
    }, 2000);
  };

  // Handle valid click (during ready phase)
  const handleValidClick = () => {
    const reactionTime = Date.now() - startTime;
    const newReactionTimes = [...reactionTimes, reactionTime];
    
    setReactionTimes(newReactionTimes);
    setGameState('clicked');

    // Update best time
    if (bestTime === null || reactionTime < bestTime) {
      setBestTime(reactionTime);
    }

    logger.info('Reaction recorded', { 
      reactionTime, 
      round: currentRound + 1 
    }, LogTags.WORD_GUESS);

    // Check if game is complete
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      completeGame(newReactionTimes);
    } else {
      proceedToNextRound();
    }
  };

  // Complete the game and submit score
  const completeGame = (finalReactionTimes) => {
    const avg = Math.round(
      finalReactionTimes.reduce((a, b) => a + b, 0) / finalReactionTimes.length
    );
    setAverageTime(avg);

    setTimeout(() => {
      setGameCompleted(true);
      submitGameScore(avg, finalReactionTimes);
    }, 1500);
  };

  // Proceed to next round
  const proceedToNextRound = () => {
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      setGameState('idle');
    }, 1500);
  };

  // Submit game score
  const submitGameScore = async (avg, allTimes) => {
    try {
      // Calculate score (lower time = higher score)
      // Perfect score of 500 for avg 200ms, decreasing as avg increases
      const score = Math.max(0, Math.round(500 - (avg - 200) * 0.5));

      await submitScore({
        game: 'reaction-time',
        playerName: 'guest',
        score,
        meta: {
          averageTime: avg,
          bestTime: Math.min(...allTimes),
          allTimes
        }
      });

      logger.info('Reaction Time score submitted', { 
        score, 
        averageTime: avg 
      }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit Reaction Time score', error, {}, LogTags.SAVE_SCORE);
    }
  };

  // Reset game to initial state
  const resetGame = () => {
    setGameState('idle');
    setCurrentRound(0);
    setReactionTimes([]);
    setStartTime(null);
    setTooEarly(false);
    setAverageTime(0);
    setBestTime(null);
    setGameCompleted(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    // Game state
    gameState,
    currentRound,
    totalRounds: TOTAL_ROUNDS,
    reactionTimes,
    tooEarly,
    averageTime,
    bestTime,
    gameCompleted,
    isGameActive,
    roundsRemaining,
    progress,

    // Actions
    startGame,
    startRound,
    handleClick,
    resetGame,
    
    // Utilities
    getPerformanceRating
  };
};