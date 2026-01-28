import { useState, useEffect, useCallback, useRef } from 'react';
import { startSimon, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

// Constants
const MAX_ROUNDS = 10;
const SEQUENCE_DISPLAY_DELAY = 1000;
const COLOR_FLASH_DURATION = 600;
const COLOR_GAP_DURATION = 300;
const PLAYER_FEEDBACK_DURATION = 200;

/**
 * Custom hook for managing Simon Says game logic
 */
export const useSimonSays = () => {
  // Game state
  const [colors, setColors] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [round, setRound] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for cleanup
  const timeoutRefs = useRef([]);

  // Computed values
  const isGameActive = !gameOver && !gameWon && !isLoading;
  const canPlayerInteract = isGameActive && !isShowingSequence;
  const gameStatus = gameWon ? 'Won!' : 
                    gameOver ? 'Game Over' : 
                    isShowingSequence ? 'Watch...' : 
                    'Your Turn';

  // Cleanup timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  // Add timeout with cleanup tracking
  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  // Initialize game
  const initializeGame = async () => {
    try {
      setIsLoading(true);
      logger.info('Starting Simon Says game', {}, LogTags.SIMON_SAYS);
      
      const response = await startSimon();
      const gameColors = response.data.colors || ['red', 'blue', 'green', 'yellow'];
      
      setColors(gameColors);
      resetGameState();
      startNewRound([]);
      
      logger.info('Simon Says initialized', { 
        colorCount: gameColors.length 
      }, LogTags.SIMON_SAYS);
    } catch (error) {
      logger.error('Failed to start Simon Says', error, {}, LogTags.SIMON_SAYS);
      
      // Fallback colors
      const fallbackColors = ['red', 'blue', 'green', 'yellow'];
      setColors(fallbackColors);
      resetGameState();
      startNewRound([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset game state
  const resetGameState = () => {
    setSequence([]);
    setPlayerSequence([]);
    setRound(0);
    setGameOver(false);
    setGameWon(false);
    setActiveColor(null);
    setIsShowingSequence(false);
    clearAllTimeouts();
  };

  // Start a new round
  const startNewRound = useCallback((previousSequence) => {
    if (colors.length === 0) return;
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...previousSequence, randomColor];
    
    setSequence(newSequence);
    setPlayerSequence([]);
    setRound(newSequence.length);
    setIsShowingSequence(true);

    // Show sequence with animations
    showSequenceAnimation(newSequence);
  }, [colors]);

  // Show sequence animation
  const showSequenceAnimation = (sequenceToShow) => {
    let currentIndex = 0;

    const showNextColor = () => {
      if (currentIndex < sequenceToShow.length) {
        setActiveColor(sequenceToShow[currentIndex]);
        
        addTimeout(() => {
          setActiveColor(null);
          currentIndex++;
          addTimeout(showNextColor, COLOR_GAP_DURATION);
        }, COLOR_FLASH_DURATION);
      } else {
        setIsShowingSequence(false);
      }
    };

    addTimeout(showNextColor, SEQUENCE_DISPLAY_DELAY);
  };

  // Handle player button press
  const handleColorPress = (color) => {
    if (!canPlayerInteract) return;

    const currentPosition = playerSequence.length;
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    // Provide visual feedback
    setActiveColor(color);
    addTimeout(() => setActiveColor(null), PLAYER_FEEDBACK_DURATION);

    // Check if the pressed color is correct
    if (sequence[currentPosition] !== color) {
      handleIncorrectMove();
    } else if (newPlayerSequence.length === sequence.length) {
      handleRoundComplete(newPlayerSequence.length);
    }
  };

  // Handle incorrect move
  const handleIncorrectMove = () => {
    setGameOver(true);
    const finalScore = Math.max(0, round - 1);
    
    submitGameScore(finalScore, round - 1);
    logger.info('Simon Says game over - wrong sequence', { 
      score: finalScore, 
      round 
    }, LogTags.SAVE_SCORE);
  };

  // Handle round completion
  const handleRoundComplete = (completedRoundLength) => {
    if (completedRoundLength >= MAX_ROUNDS) {
      // Game won
      setGameWon(true);
      const winScore = 100;
      submitGameScore(winScore, MAX_ROUNDS);
      logger.info('Simon Says game won', { score: winScore }, LogTags.SAVE_SCORE);
    } else {
      // Next round
      addTimeout(() => startNewRound(sequence), 1000);
    }
  };

  // Submit game score
  const submitGameScore = async (score, roundsCompleted) => {
    try {
      await submitScore({
        game: 'simon-says',
        playerName: 'guest',
        score,
        meta: { roundsCompleted }
      });
      
      logger.info('Simon Says score submitted', { 
        score, 
        roundsCompleted 
      }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit Simon Says score', error, {}, LogTags.SAVE_SCORE);
    }
  };

  // Restart game
  const restartGame = async () => {
    clearAllTimeouts();
    await initializeGame();
  };

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    
    // Cleanup on unmount
    return () => {
      clearAllTimeouts();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update startNewRound when colors change
  useEffect(() => {
    if (colors.length > 0 && round === 0 && !gameOver && !gameWon && !isLoading) {
      startNewRound([]);
    }
  }, [colors, startNewRound, round, gameOver, gameWon, isLoading]);

  return {
    // Game state
    colors,
    sequence,
    playerSequence,
    round,
    isShowingSequence,
    activeColor,
    gameOver,
    gameWon,
    isLoading,
    
    // Computed values
    isGameActive,
    canPlayerInteract,
    gameStatus,
    maxRounds: MAX_ROUNDS,
    sequenceLength: sequence.length,
    
    // Actions
    handleColorPress,
    restartGame,
    initializeGame
  };
};