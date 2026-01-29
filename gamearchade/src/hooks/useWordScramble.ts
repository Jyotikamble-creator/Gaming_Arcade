// Custom hook for WordScramble game state management
import { useState, useEffect, useCallback } from 'react';
import {
  WordScrambleGameState,
  WordScrambleData,
  UseWordScrambleReturn
} from '@/types/games/word-scramble';
import {
  getRandomScrambledWord,
  validateGuess,
  calculateScore
} from '@/utility/games/word-scramble';

const initialGameState: WordScrambleGameState = {
  data: { word: 'REACT', scrambled: 'TCAER' },
  guess: '',
  isLoading: false,
  attempts: 0,
  correct: false,
  showAnswer: false,
  score: 0,
  gameStartTime: null,
  gameEndTime: null,
  isGameOver: false
};

export function useWordScramble(): UseWordScrambleReturn {
  const [gameState, setGameState] = useState<WordScrambleGameState>(initialGameState);
  const [error, setError] = useState<string | null>(null);

  // Calculate game time
  const gameTime = gameState.gameStartTime && gameState.gameEndTime
    ? Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000)
    : gameState.gameStartTime
    ? Math.floor((Date.now() - gameState.gameStartTime) / 1000)
    : 0;

  // Load a new scrambled word
  const loadNewWord = useCallback(async (): Promise<void> => {
    try {
      setGameState(prevState => ({ ...prevState, isLoading: true }));
      setError(null);

      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO: Replace with actual API call
      // const response = await fetchScramble();
      const newData = getRandomScrambledWord();

      setGameState({
        ...initialGameState,
        data: newData,
        gameStartTime: Date.now(),
        isLoading: false
      });

    } catch (err) {
      console.error('Failed to load scrambled word:', err);
      setError('Failed to load new word. Using fallback data.');
      
      // Use fallback data
      const fallbackData = getRandomScrambledWord();
      setGameState({
        ...initialGameState,
        data: fallbackData,
        gameStartTime: Date.now(),
        isLoading: false
      });
    }
  }, []);

  // Set guess value
  const setGuess = useCallback((guess: string): void => {
    setGameState(prevState => ({
      ...prevState,
      guess: guess.toUpperCase()
    }));
  }, []);

  // Check the current guess
  const checkGuess = useCallback(async (): Promise<void> => {
    if (!gameState.guess.trim()) return;

    const isCorrect = validateGuess(gameState.guess, gameState.data.word);
    const newAttempts = gameState.attempts + 1;

    setGameState(prevState => ({
      ...prevState,
      attempts: newAttempts,
      correct: isCorrect,
      isGameOver: isCorrect,
      gameEndTime: isCorrect ? Date.now() : prevState.gameEndTime
    }));

    if (isCorrect) {
      const finalScore = calculateScore(100, newAttempts);
      
      setGameState(prevState => ({
        ...prevState,
        score: finalScore
      }));

      // TODO: Submit score to API
      // await submitScore({
      //   game: 'word-scramble',
      //   score: finalScore,
      //   meta: {
      //     attempts: newAttempts,
      //     word: gameState.data.word,
      //     scrambled: gameState.data.scrambled,
      //     gameTime: Math.floor((Date.now() - gameState.gameStartTime!) / 1000),
      //     correct: true
      //   }
      // });

      console.log('WordScramble completed:', {
        score: finalScore,
        attempts: newAttempts,
        word: gameState.data.word,
        gameTime: Math.floor((Date.now() - gameState.gameStartTime!) / 1000)
      });
    }
  }, [gameState.guess, gameState.data.word, gameState.attempts, gameState.gameStartTime]);

  // Reveal the answer
  const revealAnswer = useCallback((): void => {
    setGameState(prevState => ({
      ...prevState,
      showAnswer: true,
      isGameOver: true,
      gameEndTime: Date.now()
    }));

    console.log('WordScramble answer revealed:', {
      word: gameState.data.word,
      attempts: gameState.attempts
    });
  }, [gameState.data.word, gameState.attempts]);

  // Reset the game
  const resetGame = useCallback((): void => {
    setGameState(initialGameState);
    setError(null);
  }, []);

  // Get a hint for the current word
  const getHint = useCallback((): string | null => {
    const { word, category } = gameState.data;
    
    const hints = [
      `The word has ${word.length} letters`,
      `It starts with the letter "${word[0]}"`,
      `It ends with the letter "${word[word.length - 1]}"`,
      category ? `It's in the ${category} category` : 'It\'s a common word'
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  }, [gameState.data]);

  // Load initial word on mount
  useEffect(() => {
    loadNewWord();
  }, [loadNewWord]);

  return {
    gameState,
    data: gameState.data,
    guess: gameState.guess,
    isLoading: gameState.isLoading,
    attempts: gameState.attempts,
    correct: gameState.correct,
    showAnswer: gameState.showAnswer,
    score: gameState.score,
    isGameOver: gameState.isGameOver,
    gameTime,
    error,
    setGuess,
    checkGuess,
    revealAnswer,
    loadNewWord,
    resetGame,
    getHint
  };
}