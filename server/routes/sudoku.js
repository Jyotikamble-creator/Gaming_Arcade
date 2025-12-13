// Routes for sudoku game
// Provides Sudoku puzzles and validation

import express from "express";

// Create router
const router = express.Router();

// Sudoku puzzle generator
function generateCompleteBoard() {
  // Initialize empty board
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  // Function to check if a number is valid
  function isValid(board, row, col, num) {
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

  // Backtracking function to fill the board
  function fillBoard(board) {
    // Find empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
            () => Math.random() - 0.5
          );
          for (let num of numbers) {
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

// Create puzzle by removing numbers based on difficulty
function createPuzzle(difficulty = "medium") {
  // Generate complete board
  const completeBoard = generateCompleteBoard();
  const puzzle = completeBoard.map((row) => [...row]);

  // Difficulty settings: number of cells to remove
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55,
  };

  // Remove cells
  const toRemove = cellsToRemove[difficulty] || 45;
  let removed = 0;

  // Randomly remove cells
  while (removed < toRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    // Only remove if cell is not already empty
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution: completeBoard };
}

// GET /api/games/sudoku/puzzle - Get a new Sudoku puzzle
// Difficulty: easy, medium, hard
router.get("/puzzle", (req, res) => {
  try {
    // Get difficulty
    const difficulty = req.query.difficulty || "medium";
    // Validate difficulty
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res
        .status(400)
        .json({ error: "Invalid difficulty. Use: easy, medium, or hard" });
    }
    // Generate puzzle
    const { puzzle, solution } = createPuzzle(difficulty);
    // Respond with puzzle
    res.json({
      puzzle,
      solution,
      difficulty,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating Sudoku puzzle:", error);
    res.status(500).json({ error: "Failed to generate puzzle" });
  }
});

// POST /api/games/sudoku/validate - Validate a Sudoku solution
// Board: 2D array of numbers
router.post("/validate", (req, res) => {
  try {
    // Get board
    const { board, solution } = req.body;

    // Validate board
    if (!board || !solution) {
      return res.status(400).json({ error: "Board and solution are required" });
    }

    // Check if board matches solution
    let isValid = true;
    let filledCells = 0;

    // Check each cell
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0) {
          filledCells++;
          if (board[i][j] !== solution[i][j]) {
            isValid = false;
          }
        }
      }
    }

    // Check if board is complete
    const isComplete = filledCells === 81;

    // Respond with validation
    res.json({
      valid: isValid,
      complete: isComplete,
      filledCells,
      totalCells: 81,
    });
  } catch (error) {
    console.error("Error validating Sudoku:", error);
    res.status(500).json({ error: "Failed to validate solution" });
  }
});

export default router;
