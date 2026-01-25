import type { 
  SudokuBoard,
  SudokuDifficulty,
  SudokuGenerationParams,
  ISudokuStats
} from '@/types/games/sudoku';

/**
 * Generate a unique session ID for Sudoku
 * @returns Unique identifier string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `sudoku_${timestamp}_${random}`;
}

/**
 * Validate Sudoku position coordinates
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns True if valid position
 */
export function isValidSudokuPosition(row: number, col: number): boolean {
  return row >= 0 && row < 9 && col >= 0 && col < 9;
}

/**
 * Deep copy Sudoku board
 * @param board - Original board
 * @returns Deep copy of the board
 */
export function deepCopyBoard(board: SudokuBoard): SudokuBoard {
  return board.map(row => [...row]);
}

/**
 * Get difficulty parameters for puzzle generation
 * @param difficulty - Difficulty level
 * @returns Generation parameters
 */
export function getDifficultyParams(difficulty: SudokuDifficulty): SudokuGenerationParams & {
  maxHints: number;
  maxMistakes: number;
  timeLimit: number;
} {
  const params = {
    easy: {
      difficulty: 'easy' as SudokuDifficulty,
      cellsToRemove: 35,
      symmetry: 'rotational' as const,
      maxHints: 5,
      maxMistakes: 5,
      timeLimit: 0 // No time limit
    },
    medium: {
      difficulty: 'medium' as SudokuDifficulty,
      cellsToRemove: 45,
      symmetry: 'rotational' as const,
      maxHints: 3,
      maxMistakes: 3,
      timeLimit: 0
    },
    hard: {
      difficulty: 'hard' as SudokuDifficulty,
      cellsToRemove: 55,
      symmetry: 'none' as const,
      maxHints: 2,
      maxMistakes: 2,
      timeLimit: 1800 // 30 minutes
    },
    expert: {
      difficulty: 'expert' as SudokuDifficulty,
      cellsToRemove: 65,
      symmetry: 'none' as const,
      maxHints: 1,
      maxMistakes: 1,
      timeLimit: 1200 // 20 minutes
    }
  };
  
  return params[difficulty];
}

/**
 * Format time in human readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatSudokuTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get difficulty color for UI display
 * @param difficulty - Difficulty level
 * @returns CSS color hex
 */
export function getDifficultyColor(difficulty: SudokuDifficulty): string {
  const colors = {
    easy: '#22C55E',     // Green
    medium: '#3B82F6',   // Blue
    hard: '#F59E0B',     // Amber
    expert: '#DC2626'    // Red
  };
  
  return colors[difficulty];
}

/**
 * Get difficulty emoji for display
 * @param difficulty - Difficulty level
 * @returns Emoji representing difficulty
 */
export function getDifficultyEmoji(difficulty: SudokuDifficulty): string {
  const emojis = {
    easy: '🟢',
    medium: '🔵',
    hard: '🟡',
    expert: '🔴'
  };
  
  return emojis[difficulty];
}

/**
 * Convert board position to string key
 * @param row - Row index
 * @param col - Column index
 * @returns String key "row,col"
 */
export function positionToKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Parse position string key to coordinates
 * @param key - Position key "row,col"
 * @returns Object with row and col
 */
export function keyToPosition(key: string): { row: number; col: number } {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

/**
 * Get box index for a cell
 * @param row - Row index
 * @param col - Column index
 * @returns Box index (0-8)
 */
export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

/**
 * Get all cells in the same box
 * @param row - Row index
 * @param col - Column index
 * @returns Array of cell coordinates in same box
 */
export function getBoxCells(row: number, col: number): Array<{ row: number; col: number }> {
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  const cells = [];
  
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      cells.push({ row: r, col: c });
    }
  }
  
  return cells;
}

/**
 * Get possible values for a cell
 * @param board - Current board state
 * @param row - Row index
 * @param col - Column index
 * @returns Array of possible values (1-9)
 */
export function getPossibleValues(board: SudokuBoard, row: number, col: number): number[] {
  if (board[row][col] !== 0) {
    return []; // Cell is already filled
  }
  
  const used = new Set<number>();
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] !== 0) {
      used.add(board[row][c]);
    }
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] !== 0) {
      used.add(board[r][col]);
    }
  }
  
  // Check box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] !== 0) {
        used.add(board[r][c]);
      }
    }
  }
  
  // Return unused numbers
  const possible = [];
  for (let num = 1; num <= 9; num++) {
    if (!used.has(num)) {
      possible.push(num);
    }
  }
  
  return possible;
}

/**
 * Check if a value is valid for a position
 * @param board - Current board state
 * @param row - Row index
 * @param col - Column index
 * @param value - Value to check
 * @returns True if value is valid
 */
export function isValidValue(
  board: SudokuBoard, 
  row: number, 
  col: number, 
  value: number
): boolean {
  const possibleValues = getPossibleValues(board, row, col);
  return possibleValues.includes(value);
}

/**
 * Count empty cells in board
 * @param board - Sudoku board
 * @returns Number of empty cells
 */
export function countEmptyCells(board: SudokuBoard): number {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Calculate board completion percentage
 * @param board - Sudoku board
 * @returns Completion percentage (0-100)
 */
export function calculateCompletion(board: SudokuBoard): number {
  const filledCells = 81 - countEmptyCells(board);
  return Math.round((filledCells / 81) * 100);
}

/**
 * Check if board is completely filled
 * @param board - Sudoku board
 * @returns True if board is complete
 */
export function isBoardComplete(board: SudokuBoard): boolean {
  return countEmptyCells(board) === 0;
}

/**
 * Check if board is valid (no conflicts)
 * @param board - Sudoku board
 * @returns True if board has no conflicts
 */
export function isBoardValid(board: SudokuBoard): boolean {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value !== 0) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const value = board[row][col];
      if (value !== 0) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }
  
  // Check boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          const value = board[row][col];
          if (value !== 0) {
            if (seen.has(value)) return false;
            seen.add(value);
          }
        }
      }
    }
  }
  
  return true;
}

/**
 * Get performance rating based on time and difficulty
 * @param timeElapsed - Time taken in seconds
 * @param difficulty - Puzzle difficulty
 * @param hintsUsed - Number of hints used
 * @returns Performance rating
 */
export function getPerformanceRating(
  timeElapsed: number,
  difficulty: SudokuDifficulty,
  hintsUsed: number
): string {
  const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2, expert: 3 };
  const baseTime = 600; // 10 minutes baseline
  const adjustedTime = timeElapsed / difficultyMultiplier[difficulty];
  
  if (hintsUsed === 0 && adjustedTime <= baseTime * 0.5) return 'Sudoku Master';
  if (hintsUsed <= 1 && adjustedTime <= baseTime * 0.7) return 'Expert';
  if (hintsUsed <= 2 && adjustedTime <= baseTime) return 'Advanced';
  if (hintsUsed <= 3 && adjustedTime <= baseTime * 1.5) return 'Intermediate';
  return 'Beginner';
}

/**
 * Calculate score based on performance metrics
 * @param difficulty - Puzzle difficulty
 * @param timeElapsed - Time taken in seconds
 * @param hintsUsed - Number of hints used
 * @param mistakes - Number of mistakes made
 * @returns Calculated score
 */
export function calculateSudokuScore(
  difficulty: SudokuDifficulty,
  timeElapsed: number,
  hintsUsed: number,
  mistakes: number
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  };
  
  const baseScore = 1000;
  const timeBonus = Math.max(0, 3600 - timeElapsed); // Bonus for speed
  const hintPenalty = hintsUsed * 50;
  const mistakePenalty = mistakes * 25;
  
  const score = Math.round(
    (baseScore + timeBonus - hintPenalty - mistakePenalty) * 
    difficultyMultiplier[difficulty]
  );
  
  return Math.max(score, 50); // Minimum score
}

/**
 * Parse board from string representation
 * @param boardString - Board as string (81 characters, 0-9)
 * @returns Parsed 9x9 board
 */
export function parseBoardFromString(boardString: string): SudokuBoard {
  if (boardString.length !== 81) {
    throw new Error('Board string must be exactly 81 characters');
  }
  
  const board: SudokuBoard = [];
  for (let row = 0; row < 9; row++) {
    const rowData = [];
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      const value = parseInt(boardString[index]);
      if (isNaN(value) || value < 0 || value > 9) {
        throw new Error('Board string must contain only digits 0-9');
      }
      rowData.push(value);
    }
    board.push(rowData);
  }
  
  return board;
}

/**
 * Convert board to string representation
 * @param board - 9x9 Sudoku board
 * @returns Board as 81-character string
 */
export function boardToString(board: SudokuBoard): string {
  let result = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      result += board[row][col].toString();
    }
  }
  return result;
}

/**
 * Generate random board state for testing
 * @param fillPercentage - Percentage of cells to fill (0-1)
 * @returns Random board state
 */
export function generateRandomBoard(fillPercentage: number = 0.3): SudokuBoard {
  const board: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(0));
  const totalCells = 81;
  const cellsToFill = Math.floor(totalCells * fillPercentage);
  
  let filled = 0;
  while (filled < cellsToFill) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (board[row][col] === 0) {
      const possibleValues = getPossibleValues(board, row, col);
      if (possibleValues.length > 0) {
        const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        board[row][col] = value;
        filled++;
      }
    }
  }
  
  return board;
}