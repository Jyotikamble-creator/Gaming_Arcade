// Tic Tac Toe game constants and utilities
import { Player } from '@/types/games/tic-tac-toe';

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

export const checkWinner = (board: (Player | null)[]): Player | 'Draw' | null => {
  // Check for winning lines
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // Check for draw
  if (board.every(cell => cell !== null)) {
    return 'Draw';
  }

  // Game continues
  return null;
};

export const getEmptySquares = (board: (Player | null)[]): number[] => {
  return board.map((cell, index) => cell === null ? index : null)
              .filter(index => index !== null) as number[];
};

export const isValidMove = (board: (Player | null)[], index: number): boolean => {
  return index >= 0 && index < GAME_CONFIG.BOARD_SIZE && board[index] === null;
};

export const makeMove = (
  board: (Player | null)[], 
  index: number, 
  player: Player
): (Player | null)[] => {
  if (!isValidMove(board, index)) {
    return board;
  }
  
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
};

export const getNextPlayer = (currentPlayer: Player): Player => {
  return currentPlayer === 'X' ? 'O' : 'X';
};

// AI utilities for single player mode
export const getBestMove = (board: (Player | null)[], player: Player): number => {
  const emptySquares = getEmptySquares(board);
  
  // Simple AI: Try to win, then block, then random
  for (const square of emptySquares) {
    const testBoard = makeMove(board, square, player);
    if (checkWinner(testBoard) === player) {
      return square;
    }
  }
  
  // Try to block opponent
  const opponent = getNextPlayer(player);
  for (const square of emptySquares) {
    const testBoard = makeMove(board, square, opponent);
    if (checkWinner(testBoard) === opponent) {
      return square;
    }
  }
  
  // Random move
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};