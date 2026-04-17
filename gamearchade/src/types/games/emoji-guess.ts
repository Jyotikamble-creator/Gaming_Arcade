// Emoji Guess game type definitions
export type EmojiGuessGameDifficulty = 'easy' | 'medium' | 'hard';

export interface EmojiPuzzle {
  id: string;
  emojis: string;
  answer: string;
  category: string;
  difficulty: EmojiGuessGameDifficulty;
  hint?: string;
}

export interface EmojiGuessGameState {
  puzzle: EmojiPuzzle | null;
  guess: string;
  score: number;
  attempts: number;
  hintsUsed: number;
  streak: number;
  difficulty: EmojiGuessGameDifficulty | null;
  gameStarted: boolean;
  isLoading: boolean;
  message: string;
  messageType: 'success' | 'error' | 'info' | '';
  showConfetti: boolean;
}

export interface EmojiGuessAchievements {
  firstWin: boolean;
  streak5: boolean;
  streak10: boolean;
  perfectGame: boolean;
}

export interface EmojiGuessDifficultyConfig {
  label: string;
  emoji: string;
  description: string;
  basePoints: number;
  hintsAllowed: number;
  attemptPenalty: number;
  hintPenalty: number;
}

// Game Constants
export const EMOJI_GUESS_CONSTANTS = {
  MIN_POINTS: 10,
  STREAK_BONUS_THRESHOLD: 3,
  STREAK_BONUS_POINTS: 10,
  TOTAL_ROUNDS: 5,
} as const;

export const DIFFICULTY_CONFIG: Record<EmojiGuessGameDifficulty, EmojiGuessDifficultyConfig> = {
  easy: {
    label: 'Easy',
    emoji: '😊',
    description: 'Common emojis with multiple hints available',
    basePoints: 50,
    hintsAllowed: 5,
    attemptPenalty: 5,
    hintPenalty: 10,
  },
  medium: {
    label: 'Medium',
    emoji: '🎯',
    description: 'Standard emojis with limited hints',
    basePoints: 75,
    hintsAllowed: 3,
    attemptPenalty: 10,
    hintPenalty: 15,
  },
  hard: {
    label: 'Hard',
    emoji: '🔥',
    description: 'Challenging emojis with minimal hints',
    basePoints: 100,
    hintsAllowed: 1,
    attemptPenalty: 15,
    hintPenalty: 20,
  },
} as const;

// API Types
export interface EmojiGuessScoreSubmission {
  game: 'emoji-guess';
  score: number;
  playerName?: string;
  meta?: {
    puzzleId: string;
    attempts: number;
    hintsUsed: number;
    streak: number;
    difficulty: EmojiGuessGameDifficulty;
  };
}

export interface EmojiGuessPuzzleRequest {
  difficulty: EmojiGuessGameDifficulty;
}

export interface EmojiGuessPuzzleResponse {
  data: EmojiPuzzle;
}
