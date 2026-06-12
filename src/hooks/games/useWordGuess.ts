// Custom hook for WordGuess game state management
import { useState, useCallback } from 'react';
import {
  WordGuessGameState,
  WordGuessData,
  UseWordGuessReturn,
  WORD_GUESS_CONSTANTS,
  WordDifficulty,
  DIFFICULTY_CONFIG
} from '@/types/games/word-guess';

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
  isWon: false,
  currentRound: 0,
  totalRounds: WORD_GUESS_CONSTANTS.TOTAL_ROUNDS,
  difficulty: null,
  roundsCompleted: [],
  gameStarted: false
};

export function useWordGuess(): UseWordGuessReturn {
  const [gameState, setGameState] = useState<WordGuessGameState>(initialGameState);
  const [wordsList, setWordsList] = useState<WordGuessData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // All words across difficulty levels
  const allWords = {
    easy: [
      { id: 1, word: 'APPLE', description: 'A red or green fruit that grows on trees', category: 'Food' },
      { id: 2, word: 'WATER', description: 'A clear liquid that falls from the sky as rain', category: 'Nature' },
      { id: 3, word: 'TREE', description: 'A large plant with branches and leaves', category: 'Nature' },
      { id: 4, word: 'HOUSE', description: 'A building where people live', category: 'Architecture' },
      { id: 5, word: 'SMILE', description: 'A facial expression showing happiness', category: 'Emotion' },
      { id: 6, word: 'MUSIC', description: 'Organized sounds and rhythms that you hear', category: 'Art' },
      { id: 7, word: 'HEART', description: 'An organ that pumps blood in your body', category: 'Biology' },
      { id: 8, word: 'SUN', description: 'A bright star in the sky during the day', category: 'Space' }
    ],
    medium: [
      { id: 1, word: 'OCEAN', description: 'A large body of saltwater that covers most of Earth', category: 'Nature' },
      { id: 2, word: 'GUITAR', description: 'A musical instrument with strings that you strum', category: 'Music' },
      { id: 3, word: 'CASTLE', description: 'A large fortified building, typically medieval', category: 'Architecture' },
      { id: 4, word: 'BUTTERFLY', description: 'A colorful flying insect', category: 'Animals' },
      { id: 5, word: 'RAINBOW', description: 'A colorful arc that appears in the sky after rain', category: 'Nature' },
      { id: 6, word: 'TELESCOPE', description: 'An instrument used to observe distant objects', category: 'Science' },
      { id: 7, word: 'VOLCANO', description: 'A mountain that can erupt with lava', category: 'Geography' },
      { id: 8, word: 'DIAMOND', description: 'A precious gemstone that sparkles', category: 'Gems' }
    ],
    hard: [
      { id: 1, word: 'ALGORITHM', description: 'A step-by-step procedure for solving a problem', category: 'Computer Science' },
      { id: 2, word: 'SYMPHONY', description: 'A large-scale musical composition for orchestra', category: 'Music' },
      { id: 3, word: 'ARCHAEOLOGY', description: 'Study of ancient civilizations through artifacts', category: 'History' },
      { id: 4, word: 'SERENDIPITY', description: 'Finding something good by luck or chance', category: 'Fortune' },
      { id: 5, word: 'LABYRINTH', description: 'A complex maze of paths', category: 'Structure' },
      { id: 6, word: 'METAMORPHOSIS', description: 'A dramatic change in form or character', category: 'Biology' },
      { id: 7, word: 'CONSTELLATION', description: 'A group of stars forming a pattern', category: 'Astronomy' },
      { id: 8, word: 'ELOQUENCE', description: 'Fluent and expressive way of speaking', category: 'Communication' }
    ]
  };

  // Start game with difficulty selection
  const startGame = useCallback((difficulty: WordDifficulty): void => {
    try {
      setError(null);
      
      // Get words for the selected difficulty
      const selectedWords = [...allWords[difficulty]];
      
      // Shuffle words
      const shuffledWords = selectedWords.sort(() => Math.random() - 0.5);
      const wordsForGame = shuffledWords.slice(0, WORD_GUESS_CONSTANTS.TOTAL_ROUNDS);
      
      setWordsList(wordsForGame);
      
      // Get difficulty settings
      const diffConfig = DIFFICULTY_CONFIG[difficulty];
      
      // Initialize first word
      setGameState({
        ...initialGameState,
        difficulty: difficulty as WordDifficulty,
        wordData: wordsForGame[0],
        gameStarted: true,
        currentRound: 1,
        hints: diffConfig.maxHints,
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to start game:', err);
      setError('Failed to start game');
    }
  }, []);

  // Move to next word/round
  const nextRound = useCallback((): void => {
    if (gameState.currentRound < WORD_GUESS_CONSTANTS.TOTAL_ROUNDS && wordsList.length > gameState.currentRound) {
      const diffConfig = DIFFICULTY_CONFIG[gameState.difficulty!];
      
      setGameState(prevState => ({
        ...prevState,
        wordData: wordsList[gameState.currentRound],
        chosenLetters: [],
        wrongGuesses: 0,
        hints: diffConfig.maxHints,
        message: '',
        displayWord: false,
        currentRound: gameState.currentRound + 1,
        isWon: false,
        roundsCompleted: [...prevState.roundsCompleted, gameState.score]
      }));
    } else {
      // All rounds complete - end game
      setGameState(prevState => ({
        ...prevState,
        isGameOver: true,
        message: 'Game Complete!'
      }));
    }
  }, [gameState.currentRound, wordsList, gameState.difficulty, gameState.score]);

  // Select a letter
  const selectLetter = useCallback((letter: string): void => {
    if (gameState.isGameOver || gameState.chosenLetters.includes(letter) || !gameState.gameStarted) {
      return;
    }

    const upperLetter = letter.toUpperCase();
    const isCorrect = gameState.wordData.word.includes(upperLetter);
    const diffConfig = DIFFICULTY_CONFIG[gameState.difficulty!];
    
    // Calculate score for this letter
    let letterScore = 0;
    if (isCorrect) {
      letterScore = 10; // Points for correct letter
    } else {
      letterScore = -5; // Penalty for wrong letter
    }

    setGameState(prevState => {
      const newChosenLetters = [...prevState.chosenLetters, upperLetter];
      const newWrongGuesses = isCorrect ? prevState.wrongGuesses : prevState.wrongGuesses + 1;
      const newScore = Math.max(0, prevState.score + letterScore);

      // Check if word is complete
      const isComplete = prevState.wordData.word.split('').every(char => 
        newChosenLetters.includes(char)
      );

      // Check if game over (too many wrong guesses)
      const isLost = newWrongGuesses >= diffConfig.maxWrongGuesses;

      let message = '';
      let displayWord = false;
      let isWon = false;

      if (isComplete) {
        message = '✅ Correct! Word Complete!';
        const bonusScore = diffConfig.winBonus;
        return {
          ...prevState,
          chosenLetters: newChosenLetters,
          wrongGuesses: newWrongGuesses,
          score: newScore + bonusScore,
          isWon: true,
          message
        };
      } else if (isLost) {
        message = '❌ Game Over - No more wrong guesses left';
        displayWord = true;
        return {
          ...prevState,
          chosenLetters: newChosenLetters,
          wrongGuesses: newWrongGuesses,
          score: newScore,
          isWon: false,
          message,
          displayWord,
          isGameOver: false // Still allow nextRound to be called
        };
      }

      return {
        ...prevState,
        chosenLetters: newChosenLetters,
        wrongGuesses: newWrongGuesses,
        score: newScore,
        isWon: false,
        message,
        displayWord
      };
    });
  }, [gameState.isGameOver, gameState.chosenLetters, gameState.wordData.word, gameState.difficulty, gameState.gameStarted]);

  // Use a hint
  const useHint = useCallback((): void => {
    if (gameState.hints <= 0 || gameState.isWon) {
      return;
    }

    const word = gameState.wordData.word;
    const availableLetters = word.split('').filter(char => !gameState.chosenLetters.includes(char));
    
    if (availableLetters.length === 0) {
      return;
    }

    const hintLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    setGameState(prevState => ({
      ...prevState,
      chosenLetters: [...prevState.chosenLetters, hintLetter],
      hints: prevState.hints - 1,
      message: '💡 Hint revealed!',
      displayWord: false
    }));
  }, [gameState.hints, gameState.isWon, gameState.wordData.word, gameState.chosenLetters]);

  // Remove last letter
  const removeLast = useCallback((): void => {
    if (gameState.chosenLetters.length === 0 || gameState.isWon) {
      return;
    }

    setGameState(prevState => ({
      ...prevState,
      chosenLetters: prevState.chosenLetters.slice(0, -1),
      message: '⬅️ Letter removed'
    }));
  }, [gameState.chosenLetters.length, gameState.isWon]);

  // Check win (not needed for auto-check, but keep for compatibility)
  const checkWin = useCallback((): void => {
    // Win is checked automatically on letter selection
  }, []);

  // Reset game
  const resetGame = useCallback((): void => {
    setGameState(initialGameState);
    setWordsList([]);
    setError(null);
  }, []);

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
    loadNewWord: async () => {}, // Not used, compatibility only
    resetGame,
    startGame,
    nextRound,
    currentRound: gameState.currentRound,
    totalRounds: gameState.totalRounds,
    difficulty: gameState.difficulty,
    gameStarted: gameState.gameStarted
  };
}