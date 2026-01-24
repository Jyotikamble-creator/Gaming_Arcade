/**
 * TypeScript type definitions for Emoji Guess Game
 */

/**
 * Difficulty levels for emoji puzzles
 */
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

/**
 * Categories for emoji puzzles
 */
export type PuzzleCategory = 
  | 'Fantasy'
  | 'Space'
  | 'Nature'
  | 'Weather'
  | 'Food'
  | 'Beverage'
  | 'Lifestyle'
  | 'Work'
  | 'Productivity'
  | 'Entertainment'
  | 'Technology'
  | 'Emotions'
  | 'Celebration'
  | 'Sports'
  | 'Music'
  | 'Art'
  | 'Education'
  | 'Travel'
  | 'Adventure'
  | 'Animals';

/**
 * Individual emoji puzzle
 */
export interface EmojiPuzzle {
  id: number;
  emojis: string;
  answer: string;
  category: PuzzleCategory;
  difficulty: DifficultyLevel;
}

/**
 * Game session for emoji puzzles
 */
export interface EmojiGameSession {
  _id?: string;
  userId?: string;
  sessionId: string;
  currentPuzzle: EmojiPuzzle;
  startTime: Date;
  endTime?: Date;
  attempts: EmojiAttempt[];
  score: number;
  hintsUsed: number;
  completed: boolean;
  difficulty: DifficultyLevel;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Single attempt at solving a puzzle
 */
export interface EmojiAttempt {
  guess: string;
  correct: boolean;
  timestamp: Date;
  timeTaken: number; // milliseconds
}

/**
 * Statistics for emoji game performance
 */
export interface EmojiGameStats {
  totalPuzzlesSolved: number;
  averageAttempts: number;
  averageTimePerPuzzle: number;
  accuracyRate: number;
  favoriteCategory: PuzzleCategory;
  difficultiesMastered: DifficultyLevel[];
  bestStreak: number;
  currentStreak: number;
}

/**
 * Filter options for fetching puzzles
 */
export interface PuzzleFilterOptions {
  difficulty?: DifficultyLevel;
  category?: PuzzleCategory;
  excludeIds?: number[];
  limit?: number;
}

/**
 * Request body for validating an answer
 */
export interface ValidateAnswerRequest {
  puzzleId: number;
  userAnswer: string;
  sessionId: string;
  timeTaken?: number;
}

/**
 * Response for answer validation
 */
export interface ValidateAnswerResponse {
  correct: boolean;
  correctAnswer?: string;
  similarity?: number;
  feedback: string;
  score: number;
  attempts: number;
}

/**
 * Request body for starting a new game
 */
export interface StartGameRequest {
  difficulty?: DifficultyLevel;
  category?: PuzzleCategory;
  userId?: string;
}

/**
 * Response for starting a new game
 */
export interface StartGameResponse {
  sessionId: string;
  puzzle: Omit<EmojiPuzzle, 'answer'>;
  startTime: Date;
}

/**
 * Request for getting all puzzles (admin)
 */
export interface GetAllPuzzlesRequest {
  includeAnswers?: boolean;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  category: PuzzleCategory;
  totalPuzzles: number;
  averageDifficulty: string;
  completionRate: number;
}

/**
 * Leaderboard entry for emoji game
 */
export interface EmojiLeaderboardEntry {
  playerName: string;
  totalSolved: number;
  averageAttempts: number;
  fastestTime: number;
  accuracy: number;
  rank: number;
}
