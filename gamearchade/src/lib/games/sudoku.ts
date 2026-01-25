import type { 
  SudokuBoard,
  SudokuDifficulty,
  ISudokuPuzzle,
  SudokuPuzzleRequest,
  SudokuValidationRequest,
  SudokuValidationResponse,
  ISudokuError,
  ISudokuSession,
  ISudokuHint,
  ISudokuBoardValidation,
  ISudokuConflict,
  SudokuGenerationParams
} from '@/types/games/sudoku';
import { 
  generateUniqueId,
  isValidSudokuPosition,
  deepCopyBoard,
  getDifficultyParams,
  formatSudokuTime
} from '@/utility/games/sudoku';

/**
 * Generate a complete Sudoku puzzle
 * @param request - Puzzle generation parameters
 * @returns Complete puzzle with solution
 */
export function generateSudokuPuzzle(request: SudokuPuzzleRequest = {}): ISudokuPuzzle {
  const { difficulty = 'medium', seed } = request;
  const params = getDifficultyParams(difficulty);
  
  // Set random seed if provided for reproducible puzzles
  if (seed !== undefined) {
    Math.seedrandom = createSeededRandom(seed);
  }

  // Generate complete board
  const solution = generateCompleteBoard();
  
  // Create puzzle by removing numbers
  const puzzle = createPuzzle(solution, params);
  
  const puzzleId = generateUniqueId();

  return {
    puzzle,
    solution,
    difficulty,
    cellsRemoved: params.cellsToRemove,
    puzzleId,
    timestamp: new Date()
  };
}

/**
 * Validate a Sudoku board
 * @param request - Validation parameters
 * @returns Validation result
 */
export function validateSudokuBoard(request: SudokuValidationRequest): SudokuValidationResponse {
  const { board, solution } = request;
  
  // Count filled cells
  let filledCells = 0;
  const errors: ISudokuError[] = [];
  let isValid = true;

  // Check each cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      
      if (value !== 0) {
        filledCells++;
        
        // Check if value matches solution (if provided)
        if (solution && value !== solution[row][col]) {
          isValid = false;
          errors.push({
            row,
            col,
            value,
            type: 'solution',
            message: `Incorrect value. Expected ${solution[row][col]}`
          });
        }
        
        // Check for conflicts in row, column, and box
        const conflicts = findConflicts(board, row, col, value);
        if (conflicts.length > 0) {
          isValid = false;
          conflicts.forEach(conflict => {
            errors.push({
              row,
              col,
              value,
              type: conflict.type,
              message: `Conflict in ${conflict.type}`
            });
          });
        }
      }
    }
  }

  const isComplete = filledCells === 81;
  const completion = Math.round((filledCells / 81) * 100);

  return {
    valid: isValid,
    complete: isComplete,
    filledCells,
    totalCells: 81,
    errors: errors.length > 0 ? errors : undefined,
    completion
  };
}

/**
 * Create a new Sudoku game session
 * @param puzzle - Puzzle data
 * @param userId - Optional user ID
 * @param playerName - Optional player name
 * @returns New game session
 */
export function createSudokuSession(
  puzzle: ISudokuPuzzle,
  userId?: string,
  playerName?: string
): ISudokuSession {
  const sessionId = generateUniqueId();
  const difficultyConfig = getDifficultyParams(puzzle.difficulty);

  return {
    sessionId,
    userId,
    playerName,
    puzzleId: puzzle.puzzleId,
    difficulty: puzzle.difficulty,
    initialPuzzle: deepCopyBoard(puzzle.puzzle),
    currentBoard: deepCopyBoard(puzzle.puzzle),
    solution: deepCopyBoard(puzzle.solution),
    startTime: new Date(),
    timeElapsed: 0,
    isCompleted: false,
    isSolved: false,
    hints: difficultyConfig.maxHints,
    hintsUsed: 0,
    mistakes: 0,
    maxMistakes: difficultyConfig.maxMistakes,
    moves: []
  };
}

/**
 * Generate a complete valid Sudoku board
 * @returns Complete 9x9 Sudoku board
 */
export function generateCompleteBoard(): SudokuBoard {
  const board: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(0));

  function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
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

  function fillBoard(board: SudokuBoard): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoard(board);
  return board;
}

/**
 * Create puzzle by removing numbers from complete board
 * @param completeBoard - Solved Sudoku board
 * @param params - Generation parameters
 * @returns Puzzle board with empty cells
 */
function createPuzzle(completeBoard: SudokuBoard, params: SudokuGenerationParams): SudokuBoard {
  const puzzle = deepCopyBoard(completeBoard);
  const { cellsToRemove, symmetry = 'none' } = params;
  
  let removed = 0;
  const attempts = cellsToRemove * 3; // Prevent infinite loops
  let attemptCount = 0;

  while (removed < cellsToRemove && attemptCount < attempts) {
    attemptCount++;
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      const originalValue = puzzle[row][col];
      puzzle[row][col] = 0;

      // Apply symmetry if specified
      if (symmetry === 'rotational') {
        const symRow = 8 - row;
        const symCol = 8 - col;
        if (puzzle[symRow][symCol] !== 0) {
          puzzle[symRow][symCol] = 0;
          removed++;
        }
      }

      removed++;

      // Ensure puzzle still has unique solution (simplified check)
      if (!hasUniqueSolution(puzzle)) {
        puzzle[row][col] = originalValue;
        removed--;
        if (symmetry === 'rotational') {
          const symRow = 8 - row;
          const symCol = 8 - col;
          puzzle[symRow][symCol] = completeBoard[symRow][symCol];
          removed--;
        }
      }
    }
  }

  return puzzle;
}

/**
 * Find conflicts in Sudoku board
 * @param board - Sudoku board
 * @param row - Row to check
 * @param col - Column to check
 * @param value - Value to check
 * @returns Array of conflicts
 */
function findConflicts(
  board: SudokuBoard, 
  row: number, 
  col: number, 
  value: number
): ISudokuConflict[] {
  const conflicts: ISudokuConflict[] = [];

  // Check row conflicts
  const rowConflicts = [];
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === value) {
      rowConflicts.push({ row, col: c });
    }
  }
  if (rowConflicts.length > 0) {
    conflicts.push({
      cells: [{ row, col }, ...rowConflicts],
      value,
      type: 'row'
    });
  }

  // Check column conflicts
  const colConflicts = [];
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === value) {
      colConflicts.push({ row: r, col });
    }
  }
  if (colConflicts.length > 0) {
    conflicts.push({
      cells: [{ row, col }, ...colConflicts],
      value,
      type: 'column'
    });
  }

  // Check box conflicts
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  const boxConflicts = [];
  
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) {
        boxConflicts.push({ row: r, col: c });
      }
    }
  }
  if (boxConflicts.length > 0) {
    conflicts.push({
      cells: [{ row, col }, ...boxConflicts],
      value,
      type: 'box'
    });
  }

  return conflicts;
}

/**
 * Check if puzzle has unique solution (simplified)
 * @param board - Puzzle board
 * @returns True if unique solution exists
 */
function hasUniqueSolution(board: SudokuBoard): boolean {
  // Simplified check - in production, use a more sophisticated algorithm
  const solutions = solvePuzzle(deepCopyBoard(board), 2); // Find max 2 solutions
  return solutions.length === 1;
}

/**
 * Solve Sudoku puzzle using backtracking
 * @param board - Puzzle board
 * @param maxSolutions - Maximum solutions to find
 * @returns Array of solutions
 */
function solvePuzzle(board: SudokuBoard, maxSolutions: number = 1): SudokuBoard[] {
  const solutions: SudokuBoard[] = [];

  function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
    return findConflicts(board, row, col, num).length === 0;
  }

  function solve(board: SudokuBoard): boolean {
    if (solutions.length >= maxSolutions) return true;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    
    // Found complete solution
    solutions.push(deepCopyBoard(board));
    return solutions.length < maxSolutions;
  }

  solve(board);
  return solutions;
}

/**
 * Generate hint for current board state
 * @param board - Current board
 * @param solution - Complete solution
 * @returns Hint for next move
 */
export function generateSudokuHint(board: SudokuBoard, solution: SudokuBoard): ISudokuHint | null {
  // Find empty cells
  const emptyCells: Array<{ row: number; col: number }> = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  // Select random empty cell for hint
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const { row, col } = randomCell;
  const value = solution[row][col];

  return {
    row,
    col,
    value,
    technique: 'Direct Hint',
    explanation: `The value ${value} goes in row ${row + 1}, column ${col + 1}`,
    difficulty: 1
  };
}

/**
 * Create seeded random function for reproducible puzzles
 * @param seed - Random seed
 * @returns Seeded random function
 */
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}