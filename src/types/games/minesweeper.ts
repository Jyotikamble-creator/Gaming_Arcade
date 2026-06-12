/**
 * Minesweeper Game Types
 * Defines interfaces for Minesweeper game functionality
 */

// Minesweeper cell states
export type CellState = 'hidden' | 'revealed' | 'flagged' | 'questioned';

// Minesweeper cell data
export interface MinesweeperCell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestioned: boolean;
  neighborMines: number; // 0-8, -1 if mine
  state: CellState;
}

// Minesweeper board - 2D array of cells
export type MinesweeperBoard = MinesweeperCell[][];

// Game difficulty levels
export type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

// Game status
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

// Game configuration
export interface MinesweeperConfig {
  rows: number;
  cols: number;
  mines: number;
  difficulty: MinesweeperDifficulty;
}

// Complete game state
export interface MinesweeperGame {
  board: MinesweeperBoard;
  config: MinesweeperConfig;
  status: GameStatus;
  startTime: Date | null;
  endTime: Date | null;
  flagsUsed: number;
  minesRemaining: number;
  cellsRevealed: number;
  gameId: string;
  firstClick: boolean;
}

// Game statistics
export interface MinesweeperStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bestTime: number | null;
  averageTime: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

// Move types for game actions
export type MinesweeperMove = 'reveal' | 'flag' | 'unflag' | 'question' | 'unquestion';

// Game move data
export interface MinesweeperMoveData {
  row: number;
  col: number;
  move: MinesweeperMove;
}

// Game result
export interface MinesweeperResult {
  won: boolean;
  time: number; // in seconds
  score: number;
  gameId: string;
  config: MinesweeperConfig;
}

// API request/response types
export interface MinesweeperGameRequest {
  difficulty?: MinesweeperDifficulty;
  customConfig?: Partial<MinesweeperConfig>;
}

export interface MinesweeperGameResponse {
  game: MinesweeperGame;
  success: boolean;
  message?: string;
}

export interface MinesweeperMoveRequest {
  gameId: string;
  move: MinesweeperMoveData;
}

export interface MinesweeperMoveResponse {
  game: MinesweeperGame;
  result?: MinesweeperResult;
  success: boolean;
  message?: string;
}

// Leaderboard entry
export interface MinesweeperLeaderboardEntry {
  userId: string;
  username: string;
  time: number;
  difficulty: MinesweeperDifficulty;
  date: Date;
  score: number;
}

// Default configurations for each difficulty
export const MINESWEEPER_CONFIGS: Record<MinesweeperDifficulty, MinesweeperConfig> = {
  beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
    difficulty: 'beginner'
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    difficulty: 'intermediate'
  },
  expert: {
    rows: 16,
    cols: 30,
    mines: 99,
    difficulty: 'expert'
  },
  custom: {
    rows: 9,
    cols: 9,
    mines: 10,
    difficulty: 'custom'
  }
};