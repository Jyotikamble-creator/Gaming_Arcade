/**
 * Advanced Sudoku Engine with puzzle generation, solving, and validation
 * Supports multiple difficulty levels with intelligent hint generation
 */

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuPuzzle {
  puzzle: number[][];
  solution: number[][];
  difficulty: SudokuDifficulty;
  cellsRemoved: number;
  timestamp: string;
}

export interface SudokuCell {
  row: number;
  col: number;
  value: number;
}

export interface HintInfo {
  row: number;
  col: number;
  value: number;
  technique: string;
}

/**
 * Check if a number is valid in a specific cell
 */
function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

/**
 * Get all valid candidates for a cell
 */
export function getCandidates(board: number[][], row: number, col: number): number[] {
  if (board[row][col] !== 0) return [];

  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/**
 * Get all cells with only one candidate (naked singles)
 */
function findNakedSingles(board: number[][]): SudokuCell[] {
  const singles: SudokuCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const candidates = getCandidates(board, row, col);
        if (candidates.length === 1) {
          singles.push({ row, col, value: candidates[0] });
        }
      }
    }
  }

  return singles;
}

/**
 * Generate a complete valid Sudoku board using backtracking
 */
export function generateCompleteBoard(): number[][] {
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  function fillBoard(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
            () => Math.random() - 0.5
          );

          for (let num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard()) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoard();
  return board;
}

/**
 * Solve a Sudoku puzzle and return the solution
 */
export function solveSudoku(board: number[][]): number[][] | null {
  const solution = board.map(row => [...row]);

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (solution[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(solution, row, col, num)) {
              solution[row][col] = num;
              if (solve()) return true;
              solution[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  if (solve()) {
    return solution;
  }
  return null;
}

/**
 * Count empty cells in a puzzle
 */
function countEmptyCells(board: number[][]): number {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) count++;
    }
  }
  return count;
}

/**
 * Check if a puzzle has a unique solution
 */
function hasUniqueSolution(board: number[][]): boolean {
  const temp = board.map(row => [...row]);
  let solutionCount = 0;

  function countSolutions(): boolean {
    if (solutionCount > 1) return true;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (temp[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(temp, row, col, num)) {
              temp[row][col] = num;
              if (!countSolutions()) {
                solutionCount++;
                if (solutionCount > 1) return true;
              }
              temp[row][col] = 0;
            }
          }
          return false;
        }
      }
    }

    solutionCount++;
    return solutionCount > 1;
  }

  countSolutions();
  return solutionCount === 1;
}

/**
 * Create a puzzle by removing cells while maintaining unique solution
 */export function createPuzzle(difficulty: SudokuDifficulty = 'medium'): SudokuPuzzle {
  const completeBoard = generateCompleteBoard();
  const puzzle = completeBoard.map(row => [...row]);

  // Difficulty settings with adaptive cell removal
  const difficultySettings = {
    easy: { target: 30, maxTries: 5 },
    medium: { target: 45, maxTries: 8 },
    hard: { target: 55, maxTries: 15 },
    expert: { target: 60, maxTries: 20 }
  };

  const settings = difficultySettings[difficulty];
  let cellsRemoved = 0;
  const attemptedCells = new Set<string>();

  // Attempt to remove cells
  for (let attempts = 0; attempts < settings.maxTries && cellsRemoved < settings.target; attempts++) {
    let removed = 0;

    // Try to remove cells randomly
    for (let i = 0; i < 81 && cellsRemoved < settings.target; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const key = `${row}-${col}`;

      if (puzzle[row][col] !== 0 && !attemptedCells.has(key)) {
        const value = puzzle[row][col];
        puzzle[row][col] = 0;

        // Verify unique solution (only for hard/expert)
        if (difficulty === 'hard' || difficulty === 'expert') {
          if (hasUniqueSolution(puzzle)) {
            cellsRemoved++;
            removed++;
          } else {
            puzzle[row][col] = value;
          }
        } else {
          cellsRemoved++;
          removed++;
        }

        attemptedCells.add(key);
      }
    }

    if (removed === 0 && cellsRemoved > 20) break;
  }

  return {
    puzzle,
    solution: completeBoard,
    difficulty,
    cellsRemoved,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate a hint using Sudoku solving techniques
 */
export function generateHint(puzzle: number[][], initialBoard: number[][]): HintInfo | null {
  // Try to find naked singles (easiest technique)
  const nakedSingles = findNakedSingles(puzzle);
  if (nakedSingles.length > 0) {
    const hint = nakedSingles[0];
    return {
      row: hint.row,
      col: hint.col,
      value: hint.value,
      technique: 'Naked Single'
    };
  }

  // If no naked singles, find a cell with minimum candidates
  let minCandidates: SudokuCell | null = null;
  let minCount = 10;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0 && initialBoard[row][col] === 0) {
        const candidates = getCandidates(puzzle, row, col);
        if (candidates.length > 0 && candidates.length < minCount) {
          minCount = candidates.length;
          minCandidates = { row, col, value: candidates[0] };
        }
      }
    }
  }

  if (minCandidates) {
    return {
      row: minCandidates.row,
      col: minCandidates.col,
      value: minCandidates.value,
      technique: 'Hidden Single'
    };
  }

  return null;
}

/**
 * Validate a completed Sudoku board
 */
export function validateBoard(board: number[][]): boolean {
  // Check if board is complete
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
    }
  }

  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const val = board[row][col];
      if (seen.has(val)) return false;
      seen.add(val);
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const val = board[row][col];
      if (seen.has(val)) return false;
      seen.add(val);
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set<number>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = board[boxRow * 3 + i][boxCol * 3 + j];
          if (seen.has(val)) return false;
          seen.add(val);
        }
      }
    }
  }

  return true;
}

/**
 * Calculate difficulty score (0-100)
 */
export function calculateDifficultyScore(puzzle: number[][], solution: number[][]): number {
  const cellsRemoved = 81 - puzzle.flat().filter(x => x !== 0).length;
  
  // Score based on cells removed and complexity
  let score = (cellsRemoved / 81) * 100;
  
  // Adjust for average candidate count
  let totalCandidates = 0;
  let emptyCells = 0;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        emptyCells++;
        totalCandidates += getCandidates(puzzle, row, col).length;
      }
    }
  }
  
  const avgCandidates = emptyCells > 0 ? totalCandidates / emptyCells : 0;
  score = score * 0.7 + (avgCandidates / 9) * 30;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Get statistics about a puzzle
 */
export function getPuzzleStats(puzzle: number[][]): {
  cellsRemoved: number;
  emptyCells: number;
  averageCandidates: number;
  hardestCell: { row: number; col: number; candidates: number };
} {
  const cellsRemoved = 81 - puzzle.flat().filter(x => x !== 0).length;
  const emptyCells = puzzle.flat().filter(x => x === 0).length;
  
  let totalCandidates = 0;
  let hardestCell = { row: 0, col: 0, candidates: 10 };
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        const candidates = getCandidates(puzzle, row, col);
        totalCandidates += candidates.length;
        if (candidates.length > 0 && candidates.length < hardestCell.candidates) {
          hardestCell = { row, col, candidates: candidates.length };
        }
      }
    }
  }
  
  return {
    cellsRemoved,
    emptyCells,
    averageCandidates: emptyCells > 0 ? totalCandidates / emptyCells : 0,
    hardestCell
  };
}
