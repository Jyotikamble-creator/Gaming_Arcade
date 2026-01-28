import { useState, useEffect, useCallback, useRef } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

// Constants
const GAME_DURATION = 60; // seconds
const DIFFICULTY_CONFIG = {
  easy: {
    points: 5,
    label: '🟢 Easy',
    description: 'Addition & subtraction up to 50',
    color: 'green'
  },
  medium: {
    points: 10,
    label: '🟡 Medium', 
    description: 'Mixed operations up to 100',
    color: 'yellow'
  },
  hard: {
    points: 15,
    label: '🔴 Hard',
    description: 'Large numbers & challenging problems',
    color: 'red'
  }
};

/**
 * Custom hook for managing Speed Math game logic
 */
export const useSpeedMath = () => {
  // Game state
  const [difficulty, setDifficulty] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [totalProblems, setTotalProblems] = useState(0);

  // Timer ref
  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // Computed values
  const accuracy = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0;
  const isGameActive = isPlaying && timeLeft > 0;
  const canSubmitAnswer = userAnswer.trim() !== '';

  // Generate math problem based on difficulty
  const generateProblem = useCallback(() => {
    if (!difficulty) return null;

    const operations = ['+', '-', '*'];
    let a, b, op, answer;

    switch (difficulty) {
      case 'easy':
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '+') {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
          answer = a + b;
        } else {
          a = Math.floor(Math.random() * 30) + 10;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
        }
        break;

      case 'medium':
        op = operations[Math.floor(Math.random() * operations.length)];
        if (op === '+') {
          a = Math.floor(Math.random() * 50) + 1;
          b = Math.floor(Math.random() * 50) + 1;
          answer = a + b;
        } else if (op === '-') {
          a = Math.floor(Math.random() * 100) + 20;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
        } else {
          a = Math.floor(Math.random() * 12) + 1;
          b = Math.floor(Math.random() * 12) + 1;
          answer = a * b;
        }
        break;

      case 'hard':
        op = operations[Math.floor(Math.random() * operations.length)];
        if (op === '+') {
          a = Math.floor(Math.random() * 100) + 50;
          b = Math.floor(Math.random() * 100) + 50;
          answer = a + b;
        } else if (op === '-') {
          a = Math.floor(Math.random() * 200) + 50;
          b = Math.floor(Math.random() * a) + 1;
          answer = a - b;
        } else {
          a = Math.floor(Math.random() * 20) + 5;
          b = Math.floor(Math.random() * 20) + 5;
          answer = a * b;
        }
        break;

      default:
        return null;
    }

    return {
      question: `${a} ${op} ${b}`,
      answer: answer,
      operation: op
    };
  }, [difficulty]);

  // Clear all timeouts
  const clearTimeouts = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
  };

  // Start game
  const startGame = useCallback(() => {
    if (!difficulty) return;

    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setProblemsSolved(0);
    setStreak(0);
    setBestStreak(0);
    setTotalProblems(0);
    setTimeLeft(GAME_DURATION);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(generateProblem());

    logger.info('Speed Math game started', { difficulty }, LogTags.MATH_QUIZ);
  }, [difficulty, generateProblem]);

  // End game
  const endGame = useCallback(async () => {
    setIsPlaying(false);
    setGameCompleted(true);
    clearTimeouts();

    try {
      await submitScore({
        game: 'speed-math',
        playerName: 'guest',
        score,
        meta: {
          problemsSolved,
          totalProblems,
          difficulty,
          bestStreak,
          accuracy
        }
      });

      logger.info('Speed Math game completed', {
        score,
        problemsSolved,
        totalProblems,
        difficulty,
        accuracy
      }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit Speed Math score', error, {}, LogTags.SAVE_SCORE);
    }
  }, [score, problemsSolved, totalProblems, difficulty, bestStreak, accuracy]);

  // Calculate points for correct answer
  const calculatePoints = useCallback((currentStreak) => {
    const basePoints = DIFFICULTY_CONFIG[difficulty]?.points || 5;
    const streakBonus = Math.floor(currentStreak / 3) * 5; // Bonus every 3 correct
    return basePoints + streakBonus;
  }, [difficulty]);

  // Check answer
  const checkAnswer = useCallback(() => {
    if (!canSubmitAnswer || !currentProblem) return;

    const userValue = parseInt(userAnswer);
    const isCorrect = userValue === currentProblem.answer;

    setTotalProblems(prev => prev + 1);

    if (isCorrect) {
      const points = calculatePoints(streak);
      setScore(prev => prev + points);
      setProblemsSolved(prev => prev + 1);
      
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setFeedback(`Correct! +${points} points`);

      // Generate new problem after short delay
      feedbackTimeoutRef.current = setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 500);
    } else {
      setStreak(0);
      setFeedback(`Wrong! Answer was ${currentProblem.answer}`);

      // Generate new problem after showing correct answer
      feedbackTimeoutRef.current = setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    }
  }, [userAnswer, currentProblem, canSubmitAnswer, streak, calculatePoints, generateProblem]);

  // Skip problem
  const skipProblem = useCallback(() => {
    setStreak(0);
    setTotalProblems(prev => prev + 1);
    setFeedback('Skipped');

    feedbackTimeoutRef.current = setTimeout(() => {
      setCurrentProblem(generateProblem());
      setUserAnswer('');
      setFeedback('');
    }, 500);
  }, [generateProblem]);

  // Handle keyboard input
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && canSubmitAnswer) {
      checkAnswer();
    }
  }, [canSubmitAnswer, checkAnswer]);

  // Reset to menu
  const backToMenu = useCallback(() => {
    setGameCompleted(false);
    setIsPlaying(false);
    setScore(0);
    setProblemsSolved(0);
    setStreak(0);
    setBestStreak(0);
    setTotalProblems(0);
    setTimeLeft(GAME_DURATION);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(null);
    setDifficulty(null);
    clearTimeouts();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isPlaying, isGameActive, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  return {
    // Game state
    difficulty,
    isPlaying,
    currentProblem,
    userAnswer,
    score,
    problemsSolved,
    timeLeft,
    gameCompleted,
    streak,
    bestStreak,
    feedback,
    totalProblems,
    
    // Computed values
    accuracy,
    isGameActive,
    canSubmitAnswer,
    difficultyConfig: DIFFICULTY_CONFIG,
    
    // Actions
    setDifficulty,
    setUserAnswer,
    startGame,
    checkAnswer,
    skipProblem,
    handleKeyPress,
    backToMenu
  };
};