// Custom hook for WordBuilder game state management
import { useState, useEffect, useCallback } from 'react';
import {
  WordBuilderGameState,
  WordBuilderChallenge,
  WordBuilderDifficulty,
  WordBuilderLetter,
  WordBuilderCurrentWordLetter,
  WordBuilderMessageType,
  UseWordBuilderReturn
} from '@/types/games/word-builder';
import {
  getRandomChallenge,
  initializeLetters,
  calculateWordScore,
  shuffleArray
} from '@/utility/games/word-builder';

const initialGameState: WordBuilderGameState = {
  difficulty: 'easy',
  currentChallenge: null,
  availableLetters: [],
  currentWord: [],
  foundWords: [],
  score: 0,
  startTime: null,
  elapsedTime: 0,
  isCompleted: false,
  message: '',
  messageType: '',
  hintsUsed: 0
};

export function useWordBuilder(
  initialDifficulty: WordBuilderDifficulty = 'easy'
): UseWordBuilderReturn {
  const [gameState, setGameState] = useState<WordBuilderGameState>(initialGameState);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameState.startTime && !gameState.isCompleted) {
      const timer = setInterval(() => {
        setGameState(prevState => ({
          ...prevState,
          elapsedTime: Math.floor((Date.now() - prevState.startTime!) / 1000)
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.startTime, gameState.isCompleted]);

  // Start new game
  const startNewGame = useCallback((difficulty: WordBuilderDifficulty = initialDifficulty) => {
    try {
      const challenge = getRandomChallenge(difficulty);
      const availableLetters = initializeLetters(challenge);

      setGameState({
        ...initialGameState,
        difficulty,
        currentChallenge: challenge,
        availableLetters,
        startTime: Date.now()
      });
      setIsGameStarted(true);
      setError(null);
    } catch (err) {
      setError('Failed to start new game');
      console.error('Error starting new game:', err);
    }
  }, [initialDifficulty]);

  // Handle letter click
  const handleLetterClick = useCallback((letterId: number) => {
    if (gameState.isCompleted) return;

    setGameState(prevState => {
      const letterObj = prevState.availableLetters.find(l => l.id === letterId && !l.used);
      if (!letterObj) return prevState;

      return {
        ...prevState,
        availableLetters: prevState.availableLetters.map(l =>
          l.id === letterId ? { ...l, used: true } : l
        ),
        currentWord: [...prevState.currentWord, { letter: letterObj.letter, id: letterId }],
        message: '',
        messageType: '' as WordBuilderMessageType
      };
    });
  }, [gameState.isCompleted]);

  // Handle remove letter from current word
  const handleRemoveLetter = useCallback((index: number) => {
    if (gameState.isCompleted) return;

    setGameState(prevState => {
      const letterToRemove = prevState.currentWord[index];
      if (!letterToRemove) return prevState;

      return {
        ...prevState,
        availableLetters: prevState.availableLetters.map(l =>
          l.id === letterToRemove.id ? { ...l, used: false } : l
        ),
        currentWord: prevState.currentWord.filter((_, i) => i !== index),
        message: '',
        messageType: '' as WordBuilderMessageType
      };
    });
  }, [gameState.isCompleted]);

  // Show message helper
  const showMessage = useCallback((msg: string, type: WordBuilderMessageType) => {
    setGameState(prevState => ({
      ...prevState,
      message: msg,
      messageType: type
    }));

    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        message: '',
        messageType: '' as WordBuilderMessageType
      }));
    }, 3000);
  }, []);

  // Clear current word
  const clearCurrentWord = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      availableLetters: prevState.availableLetters.map(l => ({ ...l, used: false })),
      currentWord: [],
      message: '',
      messageType: '' as WordBuilderMessageType
    }));
  }, []);

  // Complete game
  const completeGame = useCallback(() => {
    if (!gameState.currentChallenge || !gameState.startTime) return;

    const finalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    // Calculate final score with bonuses/penalties
    const timeBonusThreshold = { easy: 180, medium: 240, hard: 300 }[gameState.difficulty];
    const timeBonus = finalTime < timeBonusThreshold ? Math.floor((timeBonusThreshold - finalTime) * 2) : 0;
    const hintPenalty = gameState.hintsUsed * 50;
    const finalScore = Math.max(gameState.score + timeBonus - hintPenalty, 0);

    setGameState(prevState => ({
      ...prevState,
      isCompleted: true,
      score: finalScore,
      elapsedTime: finalTime
    }));

    // Submit score logic would go here
    // submitScore({...})
  }, [gameState.currentChallenge, gameState.startTime, gameState.difficulty, gameState.score, gameState.hintsUsed]);

  // Handle submit word
  const handleSubmitWord = useCallback(() => {
    if (gameState.currentWord.length < 3) {
      showMessage('Word must be at least 3 letters!', 'error');
      return;
    }

    const word = gameState.currentWord.map(l => l.letter).join('');

    // Check if already found
    if (gameState.foundWords.includes(word)) {
      showMessage('You already found this word!', 'error');
      clearCurrentWord();
      return;
    }

    // Check if valid word
    if (gameState.currentChallenge?.targetWords.includes(word)) {
      const wordScore = calculateWordScore(word);
      
      setGameState(prevState => {
        const newFoundWords = [...prevState.foundWords, word];
        const newScore = prevState.score + wordScore;
        const isNowCompleted = newFoundWords.length >= prevState.currentChallenge!.minWords;

        return {
          ...prevState,
          foundWords: newFoundWords,
          score: newScore,
          isCompleted: isNowCompleted
        };
      });

      showMessage(`Great! +${wordScore} points`, 'success');
      clearCurrentWord();

      // Check if game should be completed
      if (gameState.foundWords.length + 1 >= gameState.currentChallenge.minWords) {
        setTimeout(() => completeGame(), 1000);
      }
    } else {
      showMessage('Not a valid word!', 'error');
      clearCurrentWord();
    }
  }, [gameState.currentWord, gameState.foundWords, gameState.currentChallenge, showMessage, clearCurrentWord, completeGame]);

  // Handle shuffle
  const handleShuffle = useCallback(() => {
    if (gameState.isCompleted) return;

    setGameState(prevState => ({
      ...prevState,
      availableLetters: shuffleArray(prevState.availableLetters)
    }));
  }, [gameState.isCompleted]);

  // Handle hint
  const handleHint = useCallback(() => {
    if (gameState.isCompleted || !gameState.currentChallenge) return;

    const unfoundWords = gameState.currentChallenge.targetWords.filter(w => 
      !gameState.foundWords.includes(w)
    );
    
    if (unfoundWords.length === 0) return;

    const hintWord = unfoundWords[0];
    showMessage(`Try: ${hintWord}`, 'hint');
    
    setGameState(prevState => ({
      ...prevState,
      hintsUsed: prevState.hintsUsed + 1
    }));
  }, [gameState.isCompleted, gameState.currentChallenge, gameState.foundWords, showMessage]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setIsGameStarted(false);
    setError(null);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    startNewGame(initialDifficulty);
  }, [startNewGame, initialDifficulty]);

  return {
    gameState,
    difficulty: gameState.difficulty,
    currentChallenge: gameState.currentChallenge,
    availableLetters: gameState.availableLetters,
    currentWord: gameState.currentWord,
    foundWords: gameState.foundWords,
    score: gameState.score,
    elapsedTime: gameState.elapsedTime,
    isCompleted: gameState.isCompleted,
    message: gameState.message,
    messageType: gameState.messageType,
    hintsUsed: gameState.hintsUsed,
    isGameStarted,
    error,
    startNewGame,
    handleLetterClick,
    handleRemoveLetter,
    handleSubmitWord,
    handleShuffle,
    handleHint,
    clearCurrentWord,
    resetGame
  };
}