// Custom hook for WordGuess game state management
import { useState, useEffect, useCallback } from 'react';
import {
  WordGuessGameState,
  WordGuessData,
  UseWordGuessReturn,
  WORD_GUESS_CONSTANTS
} from '@/types/games/word-guess';
import {
  isWordComplete,
  getRandomHintLetter,
  calculateLetterScore,
  calculateFinalScore,
  shouldEndGame,
  sanitizeWordData,
  getFallbackWordData,
  isValidWordData
} from '@/utility/games/word-guess';

const initialGameState: WordGuessGameState = {
  wordData: { word: '', description: '' },
  chosenLetters: [],
  wrongGuesses: 0,
  hints: WORD_GUESS_CONSTANTS.MAX_HINTS,
  message: '',
  displayWord: false,
  score: 0,
  isLoading: true,
  isGameOver: false,
  isWon: false
};

export function useWordGuess(): UseWordGuessReturn {
  const [gameState, setGameState] = useState<WordGuessGameState>(initialGameState);
  const [error, setError] = useState<string | null>(null);

  // Load new word from API
  const loadNewWord = useCallback(async (): Promise<void> => {
    try {
      setGameState(prevState => ({ ...prevState, isLoading: true }));
      setError(null);

      // TODO: Replace with actual API call
      // For now, using fallback data structure similar to original
      const mockApiResponse = await new Promise<any>((resolve) => {
        setTimeout(() => {
          const words = [
            { id: 1, word: 'APPLE', description: 'A red or green fruit that grows on trees', category: 'Food' },
            { id: 2, word: 'OCEAN', description: 'A large body of saltwater that covers most of Earth', category: 'Nature' },
            { id: 3, word: 'GUITAR', description: 'A musical instrument with strings that you strum or pick', category: 'Music' },
            { id: 4, word: 'CASTLE', description: 'A large fortified building, typically medieval', category: 'Architecture' },
            { id: 5, word: 'BUTTERFLY', description: 'A colorful flying insect that starts as a caterpillar', category: 'Animals' },
            { id: 6, word: 'RAINBOW', description: 'A colorful arc that appears in the sky after rain', category: 'Nature' },
            { id: 7, word: 'TELESCOPE', description: 'An instrument used to observe distant objects in space', category: 'Science' },
            { id: 8, word: 'VOLCANO', description: 'A mountain that can erupt with lava and ash', category: 'Geography' }
          ];
          resolve(words);
        }, 500);
      });

      const randomWord = mockApiResponse[Math.floor(Math.random() * mockApiResponse.length)];
      const wordData = isValidWordData(randomWord) 
        ? sanitizeWordData(randomWord)
        : getFallbackWordData();

      setGameState({
        ...initialGameState,
        wordData,
        isLoading: false
      });

    } catch (err) {
      console.error('Failed to load word:', err);
      setError('Failed to load word');
      
      // Use fallback word
      setGameState({
        ...initialGameState,
        wordData: getFallbackWordData(),
        isLoading: false
      });
    }
  }, []);

  // Select a letter
  const selectLetter = useCallback((letter: string): void => {
    if (gameState.isGameOver || gameState.chosenLetters.includes(letter)) {
      return;
    }

    const upperLetter = letter.toUpperCase();
    const isCorrect = gameState.wordData.word.includes(upperLetter);
    const letterScore = calculateLetterScore(upperLetter, gameState.wordData.word, isCorrect);

    setGameState(prevState => {
      const newChosenLetters = [...prevState.chosenLetters, upperLetter];
      const newWrongGuesses = isCorrect ? prevState.wrongGuesses : prevState.wrongGuesses + 1;
      const newScore = Math.max(0, prevState.score + letterScore);

      const gameStatus = shouldEndGame(
        newWrongGuesses,
        WORD_GUESS_CONSTANTS.MAX_WRONG_GUESSES,
        prevState.wordData.word,
        newChosenLetters
      );

      let message = '';
      let displayWord = false;

      if (gameStatus.isWon) {
        message = 'You Win!';
        displayWord = false;
      } else if (gameStatus.isGameOver) {
        message = 'Game Over';
        displayWord = true;
      }

      return {
        ...prevState,
        chosenLetters: newChosenLetters,
        wrongGuesses: newWrongGuesses,
        score: newScore,
        isGameOver: gameStatus.isGameOver,
        isWon: gameStatus.isWon,
        message,
        displayWord
      };
    });
  }, [gameState.isGameOver, gameState.chosenLetters, gameState.wordData.word]);

  // Use a hint
  const useHint = useCallback((): void => {
    if (gameState.hints <= 0 || gameState.isGameOver) {
      return;
    }

    const hintLetter = getRandomHintLetter(gameState.wordData.word, gameState.chosenLetters);
    if (!hintLetter) {
      return;
    }

    setGameState(prevState => ({
      ...prevState,
      chosenLetters: [...prevState.chosenLetters, hintLetter],
      hints: prevState.hints - 1,
      score: Math.max(0, prevState.score + WORD_GUESS_CONSTANTS.SCORE_PER_HINT)
    }));
  }, [gameState.hints, gameState.isGameOver, gameState.wordData.word, gameState.chosenLetters]);

  // Remove last letter
  const removeLast = useCallback((): void => {
    if (gameState.chosenLetters.length === 0 || gameState.isGameOver) {
      return;
    }

    setGameState(prevState => ({
      ...prevState,
      chosenLetters: prevState.chosenLetters.slice(0, -1)
    }));
  }, [gameState.chosenLetters.length, gameState.isGameOver]);

  // Check win condition
  const checkWin = useCallback((): void => {
    if (gameState.isGameOver) {
      return;
    }

    const isComplete = isWordComplete(gameState.wordData.word, gameState.chosenLetters);
    
    if (isComplete) {
      const finalScore = calculateFinalScore(gameState.score, true, WORD_GUESS_CONSTANTS.MAX_HINTS - gameState.hints);
      
      setGameState(prevState => ({
        ...prevState,
        isWon: true,
        isGameOver: true,
        message: 'You Win!',
        score: finalScore
      }));

      // TODO: Submit score to API
      // submitScore({ game: 'word-guess', score: finalScore, ... });
    } else {
      setGameState(prevState => ({
        ...prevState,
        message: 'Wrong guess',
        displayWord: true
      }));

      // Clear message after 2 seconds
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          message: '',
          displayWord: false
        }));
      }, 2000);
    }
  }, [gameState.isGameOver, gameState.wordData.word, gameState.chosenLetters, gameState.score, gameState.hints]);

  // Reset game
  const resetGame = useCallback((): void => {
    setGameState({
      ...initialGameState,
      wordData: gameState.wordData // Keep the current word
    });
    setError(null);
  }, [gameState.wordData]);

  // Load word on mount
  useEffect(() => {
    loadNewWord();
  }, [loadNewWord]);

  // Auto-check win condition when letters change
  useEffect(() => {
    if (!gameState.isGameOver && gameState.chosenLetters.length > 0) {
      const isComplete = isWordComplete(gameState.wordData.word, gameState.chosenLetters);
      if (isComplete) {
        setTimeout(() => {
          const finalScore = calculateFinalScore(
            gameState.score, 
            true, 
            WORD_GUESS_CONSTANTS.MAX_HINTS - gameState.hints
          );
          
          setGameState(prevState => ({
            ...prevState,
            isWon: true,
            isGameOver: true,
            message: 'You Win!',
            score: finalScore
          }));
        }, 100);
      }
    }
  }, [gameState.chosenLetters, gameState.wordData.word, gameState.isGameOver, gameState.score, gameState.hints]);

  return {
    gameState,
    wordData: gameState.wordData,
    chosenLetters: gameState.chosenLetters,
    wrongGuesses: gameState.wrongGuesses,
    hints: gameState.hints,
    message: gameState.message,
    displayWord: gameState.displayWord,
    score: gameState.score,
    isLoading: gameState.isLoading,
    isGameOver: gameState.isGameOver,
    isWon: gameState.isWon,
    error,
    selectLetter,
    useHint,
    removeLast,
    checkWin,
    loadNewWord,
    resetGame
  };
}