// TypeScript types for Hangman game

export type HangmanDifficulty = 'easy' | 'medium' | 'hard';

export interface HangmanDifficultyConfig {
  maxWrongGuesses: number;
  basePoints: number;
}

export const DIFFICULTY_CONFIG: Record<HangmanDifficulty, HangmanDifficultyConfig> = {
  easy: { maxWrongGuesses: 8, basePoints: 40 },
  medium: { maxWrongGuesses: 6, basePoints: 50 },
  hard: { maxWrongGuesses: 4, basePoints: 70 }
};
