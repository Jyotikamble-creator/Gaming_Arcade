// Tic Tac Toe game constants and utilities
import { Player } from '../types/ticTacToe';

// Winning line combinations
export const WINNING_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Game configuration
export const GAME_CONFIG = {
  BOARD_SIZE: 9,
  SCORE_PER_WIN: 10,
  GAME_NAME: 'tic-tac-toe'
} as const;

// Player colors
export const PLAYER_COLORS = {
  X: 'text-blue-400',
  O: 'text-red-400',
  Draw: 'text-yellow-400'
} as const;

// Utility functions
export const getPlayerColor = (player: Player | 'Draw'): string => {
  return PLAYER_COLORS[player];
};

export const getWinnerMessage = (winner: Player | 'Draw'): string => {
  return winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`;
};