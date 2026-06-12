// TypeScript types for Tic Tac Toe game

export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];
export type Winner = Player | 'Draw' | null;

export interface GameScores {
  X: number;
  O: number;
}

export interface TicTacToeStats {
  isXNext: boolean;
  scores: GameScores;
  gamesPlayed: number;
}

export interface TicTacToeBoardProps {
  board: Board;
  onClick: (index: number) => void;
}

export interface TicTacToeControlsProps {
  onNewGame: () => void;
  onResetScores: () => void;
}

export interface TicTacToeGameStatusProps {
  winner: Winner;
}

export interface TicTacToeStatsProps {
  isXNext: boolean;
  scores: GameScores;
  gamesPlayed: number;
}

export interface TicTacToeGameState {
  board: Board;
  isXNext: boolean;
  winner: Winner;
  gameCount: number;
  scores: GameScores;
}

export interface TicTacToeHookReturn {
  board: Board;
  isXNext: boolean;
  winner: Winner;
  scores: GameScores;
  gamesPlayed: number;
  handleClick: (index: number) => void;
  resetGame: () => void;
  resetScores: () => void;
}

export type TicTacToeGameDifficulty = 'easy' | 'medium' | 'hard';

export interface TicTacToeDifficultyConfig {
  basePoints: number;
  aiLevel: string;
  timeLimit: number | null;
  winCondition: 'single' | 'bestOf3' | 'bestOf5';
  maxGames: number;
}

export const DIFFICULTY_CONFIG: Record<TicTacToeGameDifficulty, TicTacToeDifficultyConfig> = {
  easy: {
    basePoints: 50,
    aiLevel: 'easy',
    timeLimit: null,
    winCondition: 'single',
    maxGames: 1,
  },
  medium: {
    basePoints: 75,
    aiLevel: 'medium',
    timeLimit: 30,
    winCondition: 'bestOf3',
    maxGames: 3,
  },
  hard: {
    basePoints: 100,
    aiLevel: 'hard',
    timeLimit: 10,
    winCondition: 'bestOf5',
    maxGames: 5,
  },
};