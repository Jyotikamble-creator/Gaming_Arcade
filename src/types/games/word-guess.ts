// WordGuess game type definitions
export type WordDifficulty = 'easy' | 'medium' | 'hard';

export interface WordGuessData {
  id?: number;
  word: string;
  description: string;
  category?: string;
}

export interface WordGuessGameState {
  wordData: WordGuessData;
  chosenLetters: string[];
  wrongGuesses: number;
  hints: number;
  message: string;
  displayWord: boolean;
  score: number;
  isLoading: boolean;
  isGameOver: boolean;
  isWon: boolean;
  currentRound: number;
  totalRounds: number;
  difficulty: WordDifficulty | null;
  roundsCompleted: number[];
  gameStarted: boolean;
}

export interface WordGuessSettings {
  maxWrongGuesses: number;
  maxHints: number;
  scorePerCorrectLetter: number;
  scorePerWrongLetter: number;
  scorePerHint: number;
  winBonus: number;
}

export interface WordGuessPerformanceRating {
  text: string;
  color: string;
  description: string;
}

// Component Props Interfaces
export interface WordDisplayProps {
  word: string;
  chosenLetters: string[];
  showWord?: boolean;
}

export interface LetterSelectorProps {
  chosenLetters: string[];
  onSelectLetter: (letter: string) => void;
  disabled: boolean;
}

export interface GameControlsProps {
  onRemoveLast: () => void;
  onUseHint: () => void;
  onGuess: () => void;
  onRestart: () => void;
  chosenLetters: string[];
  hints: number;
  disabled: boolean;
}

export interface GameStatsProps {
  score: number;
  wrongGuesses: number;
  maxWrongGuesses: number;
  hints: number;
  maxHints: number;
}

export interface GameMessageProps {
  message: string;
  word: string;
  showWord: boolean;
  isWon: boolean;
  isGameOver: boolean;
}

export interface WordGuessCompletedModalProps {
  isOpen: boolean;
  isWon: boolean;
  score: number;
  word: string;
  chosenLetters: string[];
  wrongGuesses: number;
  hintsUsed: number;
  onClose: () => void;
  onNewGame: () => void;
}

export interface WordHintDisplayProps {
  description: string;
  category?: string;
}

// Hook Return Type
export interface UseWordGuessReturn {
  gameState: WordGuessGameState;
  wordData: WordGuessData;
  chosenLetters: string[];
  wrongGuesses: number;
  hints: number;
  message: string;
  displayWord: boolean;
  score: number;
  isLoading: boolean;
  isGameOver: boolean;
  isWon: boolean;
  error: string | null;
  selectLetter: (letter: string) => void;
  useHint: () => void;
  removeLast: () => void;
  checkWin: () => void;
  loadNewWord: () => Promise<void>;
  resetGame: () => void;
  startGame: (difficulty: WordDifficulty) => void;
  nextRound: () => void;
  currentRound: number;
  totalRounds: number;
  difficulty: WordDifficulty | null;
  gameStarted: boolean;
}

// API Types
export interface WordGuessScoreSubmission {
  game: 'word-guess';
  score: number;
  playerName?: string;
  meta?: {
    word: string;
    wrongGuesses: number;
    hintsUsed: number;
    chosenLetters: string[];
  };
}

// Game Constants
export const WORD_GUESS_CONSTANTS = {
  MAX_WRONG_GUESSES: 3,
  MAX_HINTS: 3,
  SCORE_PER_CORRECT_LETTER: 10,
  SCORE_PER_WRONG_LETTER: -2,
  SCORE_PER_HINT: -5,
  WIN_BONUS: 50,
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  TOTAL_ROUNDS: 5
} as const;

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    maxHints: 5,
    maxWrongGuesses: 5,
    winBonus: 100
  },
  medium: {
    label: 'Medium',
    maxHints: 3,
    maxWrongGuesses: 3,
    winBonus: 200
  },
  hard: {
    label: 'Hard',
    maxHints: 1,
    maxWrongGuesses: 2,
    winBonus: 300
  }
} as const;

export default WordGuessGameState;