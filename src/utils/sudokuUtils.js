// Utility functions for Sudoku board generation and validation

/**
 * Check if a number is valid at a given position
 */
export const isValidMove = (board, row, col, num) => {
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
};

/**
 * Generate a complete valid Sudoku board using backtracking
 */
export const generateCompleteBoard = () => {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));

  // Backtracking function to fill the board
  const fillBoard = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // Shuffle numbers for randomness
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          
          for (let num of numbers) {
            if (isValidMove(board, row, col, num)) {
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
  };

  fillBoard(board);
  return board;
};

/**
 * Create a puzzle by removing numbers from a complete board
 */
export const createPuzzle = (difficulty = 'medium') => {
  const completeBoard = generateCompleteBoard();
  const puzzle = completeBoard.map(row => [...row]);

  // Difficulty settings: number of cells to remove
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55
  };

  const toRemove = cellsToRemove[difficulty] || 45;
  let removed = 0;

  while (removed < toRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution: completeBoard };
};

/**
 * Check if a board is completely and correctly filled
 */
export const isBoardComplete = (board, solution) => {
  // Check if all cells are filled
  const isFilled = board.every(row => row.every(cell => cell !== 0));

  if (!isFilled) return false;

  // Check if solution is correct
  return board.every((row, i) =>
    row.every((cell, j) => cell === solution[i][j])
  );
};

/**
 * Format time in mm:ss format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate final score based on game performance
 */
export const calculateScore = (difficulty, elapsedTime, mistakes, hintsUsed) => {
  const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1.5;
  const baseScore = 1000 * difficultyMultiplier;
  const timePenalty = Math.min(elapsedTime, 600); // Max 600 seconds penalty
  const mistakesPenalty = mistakes * 50;
  const hintsPenalty = hintsUsed * 100;
  
  return Math.max(Math.round(baseScore - timePenalty - mistakesPenalty - hintsPenalty), 100);
};