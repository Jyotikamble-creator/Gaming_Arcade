/**
 * TypeScript type definitions for Memory Card Game
 */

/**
 * Card themes
 */
export type CardTheme = 'fruits' | 'animals' | 'emojis' | 'numbers' | 'letters';

/**
 * Difficulty levels based on number of pairs
 */
export type MemoryDifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

/**
 * Card status
 */
export type CardStatus = 'hidden' | 'flipped' | 'matched';

/**
 * Individual memory card
 */
export interface MemoryCard {
  id: number;
  value: string;
  matched: boolean;
  flipped?: boolean;
  pairId?: number; // To identify matching pairs
}

/**
 * Card flip action
 */
export interface CardFlip {
  cardId: number;
  timestamp: Date;
  wasMatch: boolean;
  pairCardId?: number;
}

/**
 * Memory game session
 */
export interface MemoryGameSession {
  _id?: string;
  userId?: string;
  sessionId: string;
  cards: MemoryCard[];
  flips: CardFlip[];
  matches: number;
  totalPairs: number;
  moves: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  difficulty: MemoryDifficultyLevel;
  theme: CardTheme;
  score: number;
  timeLimit?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request body for starting a new game
 */
export interface StartGameRequest {
  difficulty?: MemoryDifficultyLevel;
  theme?: CardTheme;
  userId?: string;
  timeLimit?: number;
}

/**
 * Response for starting a new game
 */
export interface StartGameResponse {
  sessionId: string;
  cards: Omit<MemoryCard, 'value' | 'pairId'>[]; // Hide values from client
  totalPairs: number;
  difficulty: MemoryDifficultyLevel;
  theme: CardTheme;
  startTime: Date;
  timeLimit?: number;
}

/**
 * Request body for flipping cards
 */
export interface FlipCardRequest {
  sessionId: string;
  cardIds: number[];
}

/**
 * Response for flipping cards
 */
export interface FlipCardResponse {
  match: boolean;
  cards: {
    id: number;
    value: string;
    matched: boolean;
  }[];
  moves: number;
  matches: number;
  completed: boolean;
  score?: number;
  message: string;
}

/**
 * Request body for completing a game
 */
export interface CompleteGameRequest {
  sessionId: string;
}

/**
 * Response for completing a game
 */
export interface CompleteGameResponse {
  sessionId: string;
  completed: boolean;
  moves: number;
  matches: number;
  totalPairs: number;
  timeTaken: number;
  score: number;
  performance: string;
}

/**
 * Memory game statistics
 */
export interface MemoryGameStats {
  totalGamesPlayed: number;
  totalGamesCompleted: number;
  completionRate: number;
  averageMoves: number;
  bestMoves: number;
  averageTime: number;
  bestTime: number;
  averageScore: number;
  bestScore: number;
  perfectGames: number;
  favoriteTheme: CardTheme;
  difficultiesMastered: MemoryDifficultyLevel[];
  currentStreak: number;
  bestStreak: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  efficiency: number; // Perfect moves would be totalPairs
  speed: number; // Time per move
  accuracy: number; // Matches / Moves ratio
  rating: 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Needs Practice';
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  theme: CardTheme;
  values: string[];
  displayName: string;
  icon: string;
}

/**
 * Difficulty configuration
 */
export interface DifficultyConfig {
  difficulty: MemoryDifficultyLevel;
  pairs: number;
  timeLimit?: number;
  scoreMultiplier: number;
}

/**
 * Leaderboard entry
 */
export interface MemoryLeaderboardEntry {
  playerName: string;
  bestScore: number;
  bestMoves: number;
  bestTime: number;
  gamesCompleted: number;
  perfectGames: number;
  rank: number;
}

/**
 * Game state for client
 */
export interface GameState {
  sessionId: string;
  cards: Array<{
    id: number;
    matched: boolean;
    flipped: boolean;
    value?: string; // Only shown when flipped
  }>;
  moves: number;
  matches: number;
  totalPairs: number;
  startTime: Date;
  timeElapsed: number;
  completed: boolean;
  score: number;
}
