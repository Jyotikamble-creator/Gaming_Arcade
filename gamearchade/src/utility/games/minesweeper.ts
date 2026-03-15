import type {
  MinesweeperBoard,
  MinesweeperCell,
  MinesweeperConfig,
  CellState
} from '@/types/games/minesweeper';

/**
 * Generate an empty Minesweeper board
 */
export function generateBoard(rows: number, cols: number): MinesweeperBoard {
  const board: MinesweeperBoard = [];

  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = createCell(row, col);
    }
  }

  return board;
}

/**
 * Create a single Minesweeper cell
 */
export function createCell(row: number, col: number): MinesweeperCell {
  return {
    row,
    col,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    isQuestioned: false,
    neighborMines: 0,
    state: 'hidden'
  };
}

/**
 * Place mines randomly on the board, avoiding the first click position
 */
export function placeMines(
  board: MinesweeperBoard,
  mineCount: number,
  avoidRow: number,
  avoidCol: number
): MinesweeperBoard {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const rows = newBoard.length;
  const cols = newBoard[0].length;

  let minesPlaced = 0;

  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    // Don't place mine on first click position or if already has mine
    if ((row === avoidRow && col === avoidCol) || newBoard[row][col].isMine) {
      continue;
    }

    newBoard[row][col].isMine = true;
    minesPlaced++;
  }

  return newBoard;
}

/**
 * Calculate neighbor mine counts for all cells
 */
export function calculateNeighborCounts(board: MinesweeperBoard): MinesweeperBoard {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const rows = newBoard.length;
  const cols = newBoard[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].neighborMines = countNeighborMines(newBoard, row, col);
      } else {
        newBoard[row][col].neighborMines = -1;
      }
    }
  }

  return newBoard;
}

/**
 * Count mines in neighboring cells
 */
export function countNeighborMines(board: MinesweeperBoard, row: number, col: number): number {
  const neighbors = getCellNeighbors(board, row, col);
  return neighbors.filter(([r, c]) => board[r][c].isMine).length;
}

/**
 * Get all neighboring cell coordinates
 */
export function getCellNeighbors(board: MinesweeperBoard, row: number, col: number): [number, number][] {
  const neighbors: [number, number][] = [];
  const rows = board.length;
  const cols = board[0].length;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;

      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        neighbors.push([newRow, newCol]);
      }
    }
  }

  return neighbors;
}

/**
 * Reveal a cell and return the number of cells revealed
 */
export function revealCell(board: MinesweeperBoard, row: number, col: number): number {
  const cell = board[row][col];

  if (cell.isRevealed || cell.isFlagged || cell.isMine) {
    return 0;
  }

  cell.isRevealed = true;
  cell.state = 'revealed';

  // If cell has no neighboring mines, reveal all neighbors
  if (cell.neighborMines === 0) {
    return 1 + autoRevealEmptyCells(board, row, col);
  }

  return 1;
}

/**
 * Auto-reveal empty cells and their neighbors recursively
 */
export function autoRevealEmptyCells(board: MinesweeperBoard, row: number, col: number): number {
  const neighbors = getCellNeighbors(board, row, col);
  let revealed = 0;

  for (const [nRow, nCol] of neighbors) {
    const neighbor = board[nRow][nCol];

    if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
      neighbor.isRevealed = true;
      neighbor.state = 'revealed';
      revealed++;

      // If this neighbor also has no mines, continue revealing
      if (neighbor.neighborMines === 0) {
        revealed += autoRevealEmptyCells(board, nRow, nCol);
      }
    }
  }

  return revealed;
}

/**
 * Check if the game has been won
 */
export function checkWinCondition(game: { board: MinesweeperBoard; config: MinesweeperConfig; cellsRevealed: number }): boolean {
  const { board, config, cellsRevealed } = game;
  const totalCells = config.rows * config.cols;
  const totalMines = config.mines;
  const cellsToReveal = totalCells - totalMines;

  return cellsRevealed >= cellsToReveal;
}

/**
 * Deep copy a Minesweeper board
 */
export function deepCopyBoard(board: MinesweeperBoard): MinesweeperBoard {
  return board.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Get cell display value for rendering
 */
export function getCellDisplayValue(cell: MinesweeperCell): string {
  if (cell.isFlagged) return '🚩';
  if (cell.isQuestioned) return '?';
  if (!cell.isRevealed) return '';

  if (cell.isMine) return '💣';
  if (cell.neighborMines === 0) return '';

  return cell.neighborMines.toString();
}

/**
 * Get cell color class based on state and value
 */
export function getCellColorClass(cell: MinesweeperCell): string {
  if (!cell.isRevealed) {
    if (cell.isFlagged) return 'bg-red-500';
    if (cell.isQuestioned) return 'bg-yellow-500';
    return 'bg-gray-400 hover:bg-gray-300';
  }

  if (cell.isMine) return 'bg-red-600';

  // Color based on neighbor count
  const colors = [
    'bg-green-200', // 0
    'bg-blue-200',  // 1
    'bg-green-300', // 2
    'bg-red-300',   // 3
    'bg-purple-300', // 4
    'bg-yellow-300', // 5
    'bg-pink-300',  // 6
    'bg-gray-300',  // 7
    'bg-black'      // 8
  ];

  return colors[cell.neighborMines] || 'bg-gray-200';
}

/**
 * Validate Minesweeper configuration
 */
export function validateMinesweeperConfig(config: MinesweeperConfig): string[] {
  const errors: string[] = [];

  if (config.rows < 5 || config.rows > 30) {
    errors.push('Rows must be between 5 and 30');
  }

  if (config.cols < 5 || config.cols > 50) {
    errors.push('Columns must be between 5 and 50');
  }

  if (config.mines < 1) {
    errors.push('Must have at least 1 mine');
  }

  const maxMines = config.rows * config.cols - 9; // Leave at least 9 safe cells
  if (config.mines > maxMines) {
    errors.push(`Too many mines. Maximum allowed: ${maxMines}`);
  }

  return errors;
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatMinesweeperTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate 3BV (3 Button Value) - theoretical minimum clicks to solve
 */
export function calculate3BV(board: MinesweeperBoard): number {
  let bv = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];

      // Count non-mine cells that need to be clicked
      if (!cell.isMine) {
        // Check if this is a "opening" (empty cell that reveals multiple cells)
        const neighbors = getCellNeighbors(board, row, col);
        const hasMineNeighbors = neighbors.some(([r, c]) => board[r][c].isMine);

        if (cell.neighborMines === 0 || !hasMineNeighbors) {
          bv++;
        }
      }
    }
  }

  return bv;
}