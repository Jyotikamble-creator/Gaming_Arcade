/**
 * Sudoku Game API Client
 * Handles all API communication with the backend Sudoku service
 */

import type { SudokuDifficulty } from '@/types/games/sudoku';

export interface SudokuPuzzle {
  puzzle: number[][];
  solution: number[][];
  difficulty: SudokuDifficulty;
  cellsRemoved: number;
  difficultyScore: number;
  timestamp: string;
}

export interface SudokuHint {
  row: number;
  col: number;
  value: number;
  technique: string;
}

export interface ValidationResult {
  valid: boolean;
  complete: boolean;
  filledCells: number;
  correctCells: number;
  totalCells: number;
  accuracy: number;
}

export interface CellCheckResult {
  isCorrect: boolean;
  correctValue: number;
}

/**
 * Get a new Sudoku puzzle
 */
export async function getPuzzle(difficulty: SudokuDifficulty = 'medium'): Promise<SudokuPuzzle> {
  const response = await fetch(
    `/api/games/sudoku/puzzle?difficulty=${difficulty}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get puzzle: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a hint for the current puzzle
 */
export async function getHint(
  puzzle: number[][],
  initialBoard: number[][]
): Promise<SudokuHint | null> {
  const response = await fetch('/api/games/sudoku/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puzzle, initialBoard }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get hint: ${response.statusText}`);
  }

  const data = await response.json();
  return data.hint;
}

/**
 * Validate a completed puzzle
 */
export async function validatePuzzle(
  board: number[][],
  solution: number[][]
): Promise<ValidationResult> {
  const response = await fetch('/api/games/sudoku/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, solution }),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate puzzle: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if a single cell is correct
 */
export async function checkCell(
  row: number,
  col: number,
  value: number,
  solution: number[][]
): Promise<CellCheckResult> {
  const response = await fetch('/api/games/sudoku/check-cell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col, value, solution }),
  });

  if (!response.ok) {
    throw new Error(`Failed to check cell: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get Sudoku service statistics
 */
export async function getStats() {
  const response = await fetch('/api/games/sudoku/stats');

  if (!response.ok) {
    throw new Error(`Failed to get stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calculate score based on game metrics
 */
export function calculateGameScore(
  time: number,
  mistakes: number,
  hintsUsed: number,
  difficulty: SudokuDifficulty
): number {
  const baseScore = 1000;
  const timeBonus = Math.max(0, 500 - time / 2);
  const mistakePenalty = mistakes * 50;
  const hintPenalty = hintsUsed * 100;
  
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 2.5,
  };

  const multiplier = difficultyMultipliers[difficulty];
  
  return Math.max(0, Math.round((baseScore + timeBonus - mistakePenalty - hintPenalty) * multiplier));
}

/**
 * Format time in mm:ss format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(
  score: number
): { stars: number; label: string; color: string } {
  if (score >= 2000) return { stars: 5, label: 'Perfect!', color: '#fbbf24' };
  if (score >= 1500) return { stars: 4, label: 'Excellent!', color: '#a78bfa' };
  if (score >= 1000) return { stars: 3, label: 'Great!', color: '#60a5fa' };
  if (score >= 500) return { stars: 2, label: 'Good!', color: '#34d399' };
  return { stars: 1, label: 'Completed!', color: '#94a3b8' };
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: SudokuDifficulty): string {
  const colors = {
    easy: 'green',
    medium: 'yellow',
    hard: 'red',
    expert: 'purple',
  };
  return colors[difficulty];
}

/**
 * Get difficulty emoji
 */
export function getDifficultyEmoji(difficulty: SudokuDifficulty): string {
  const emojis = {
    easy: '😊',
    medium: '🤔',
    hard: '😤',
    expert: '🧠',
  };
  return emojis[difficulty];
}

/**
 * Validate board format
 */
export function isValidBoardFormat(board: unknown): board is number[][] {
  if (!Array.isArray(board)) return false;
  if (board.length !== 9) return false;

  return board.every(
    row => Array.isArray(row) && 
            row.length === 9 && 
            row.every(cell => typeof cell === 'number' && cell >= 0 && cell <= 9)
  );
}

/**
 * Get candidates for a cell (possible values)
 */
export function getCandidates(board: number[][], row: number, col: number): number[] {
  if (board[row][col] !== 0) return [];

  const candidates: number[] = [];

  for (let num = 1; num <= 9; num++) {
    // Check row
    let valid = true;
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) {
        valid = false;
        break;
      }
    }

    if (!valid) continue;

    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) {
        valid = false;
        break;
      }
    }

    if (!valid) continue;

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) {
      candidates.push(num);
    }
  }

  return candidates;
}

/**
 * Get progress percentage
 */
export function getProgressPercentage(board: number[][]): number {
  const filled = board.flat().filter(cell => cell !== 0).length;
  return Math.round((filled / 81) * 100);
}

/**
 * Export game session data
 */
export function exportGameData(
  board: number[][],
  initialBoard: number[][],
  solution: number[][],
  difficulty: SudokuDifficulty,
  time: number,
  mistakes: number,
  hintsUsed: number
) {
  return {
    board,
    initialBoard,
    solution,
    difficulty,
    time,
    mistakes,
    hintsUsed,
    timestamp: new Date().toISOString(),
  };
}
