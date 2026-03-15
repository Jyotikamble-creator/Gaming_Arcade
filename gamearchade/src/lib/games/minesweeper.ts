import type {
  MinesweeperBoard,
  MinesweeperCell,
  MinesweeperConfig,
  MinesweeperGame,
  MinesweeperDifficulty,
  MinesweeperMoveData,
  MinesweeperResult,
  GameStatus,
  MINESWEEPER_CONFIGS
} from '@/types/games/minesweeper';
import {
  generateBoard,
  placeMines,
  calculateNeighborCounts,
  revealCell,
  autoRevealEmptyCells,
  checkWinCondition,
  getCellNeighbors
} from '@/utility/games/minesweeper';

/**
 * Create a new Minesweeper game
 */
export function createMinesweeperGame(
  difficulty: MinesweeperDifficulty = 'beginner',
  customConfig?: Partial<MinesweeperConfig>
): MinesweeperGame {
  const config = customConfig
    ? { ...MINESWEEPER_CONFIGS[difficulty], ...customConfig, difficulty }
    : MINESWEEPER_CONFIGS[difficulty];

  const board = generateBoard(config.rows, config.cols);

  return {
    board,
    config,
    status: 'ready',
    startTime: null,
    endTime: null,
    flagsUsed: 0,
    minesRemaining: config.mines,
    cellsRevealed: 0,
    gameId: generateGameId(),
    firstClick: true
  };
}

/**
 * Start a Minesweeper game (place mines after first click)
 */
export function startMinesweeperGame(
  game: MinesweeperGame,
  firstClickRow: number,
  firstClickCol: number
): MinesweeperGame {
  if (game.status !== 'ready') return game;

  const newGame = { ...game };
  newGame.status = 'playing';
  newGame.startTime = new Date();

  // Place mines avoiding the first click position
  const boardWithMines = placeMines(newGame.board, newGame.config.mines, firstClickRow, firstClickCol);
  newGame.board = calculateNeighborCounts(boardWithMines);

  return newGame;
}

/**
 * Make a move in the Minesweeper game
 */
export function makeMinesweeperMove(
  game: MinesweeperGame,
  move: MinesweeperMoveData
): { game: MinesweeperGame; result?: MinesweeperResult } {
  if (game.status !== 'playing' && game.status !== 'ready') {
    return { game };
  }

  let newGame = { ...game };
  const { row, col, move: moveType } = move;

  // Handle first click
  if (newGame.firstClick) {
    newGame = startMinesweeperGame(newGame, row, col);
    newGame.firstClick = false;
  }

  const cell = newGame.board[row][col];

  switch (moveType) {
    case 'reveal':
      return handleRevealMove(newGame, row, col);
    case 'flag':
      return handleFlagMove(newGame, row, col);
    case 'unflag':
      return handleUnflagMove(newGame, row, col);
    case 'question':
      return handleQuestionMove(newGame, row, col);
    case 'unquestion':
      return handleUnquestionMove(newGame, row, col);
    default:
      return { game: newGame };
  }
}

/**
 * Handle cell reveal move
 */
function handleRevealMove(game: MinesweeperGame, row: number, col: number): { game: MinesweeperGame; result?: MinesweeperResult } {
  const newGame = { ...game };
  const cell = newGame.board[row][col];

  if (cell.isFlagged || cell.isRevealed) {
    return { game: newGame };
  }

  // Hit a mine - game over
  if (cell.isMine) {
    newGame.status = 'lost';
    newGame.endTime = new Date();
    revealAllMines(newGame.board);
    return {
      game: newGame,
      result: calculateResult(newGame)
    };
  }

  // Reveal the cell and potentially adjacent empty cells
  const revealedCells = revealCell(newGame.board, row, col);
  newGame.cellsRevealed += revealedCells;

  // Check win condition
  if (checkWinCondition(newGame)) {
    newGame.status = 'won';
    newGame.endTime = new Date();
    return {
      game: newGame,
      result: calculateResult(newGame)
    };
  }

  return { game: newGame };
}

/**
 * Handle flag move
 */
function handleFlagMove(game: MinesweeperGame, row: number, col: number): { game: MinesweeperGame; result?: MinesweeperResult } {
  const newGame = { ...game };
  const cell = newGame.board[row][col];

  if (cell.isRevealed) return { game: newGame };

  if (!cell.isFlagged && !cell.isQuestioned) {
    cell.isFlagged = true;
    cell.state = 'flagged';
    newGame.flagsUsed++;
    newGame.minesRemaining--;
  }

  return { game: newGame };
}

/**
 * Handle unflag move
 */
function handleUnflagMove(game: MinesweeperGame, row: number, col: number): { game: MinesweeperGame; result?: MinesweeperResult } {
  const newGame = { ...game };
  const cell = newGame.board[row][col];

  if (cell.isFlagged) {
    cell.isFlagged = false;
    cell.state = 'hidden';
    newGame.flagsUsed--;
    newGame.minesRemaining++;
  }

  return { game: newGame };
}

/**
 * Handle question mark move
 */
function handleQuestionMove(game: MinesweeperGame, row: number, col: number): { game: MinesweeperGame; result?: MinesweeperResult } {
  const newGame = { ...game };
  const cell = newGame.board[row][col];

  if (cell.isRevealed || cell.isFlagged) return { game: newGame };

  cell.isQuestioned = true;
  cell.state = 'questioned';

  return { game: newGame };
}

/**
 * Handle un-question move
 */
function handleUnquestionMove(game: MinesweeperGame, row: number, col: number): { game: MinesweeperGame; result?: MinesweeperResult } {
  const newGame = { ...game };
  const cell = newGame.board[row][col];

  if (cell.isQuestioned) {
    cell.isQuestioned = false;
    cell.state = 'hidden';
  }

  return { game: newGame };
}

/**
 * Reveal all mines (for game over)
 */
function revealAllMines(board: MinesweeperBoard): void {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];
      if (cell.isMine) {
        cell.isRevealed = true;
        cell.state = 'revealed';
      }
    }
  }
}

/**
 * Calculate game result
 */
function calculateResult(game: MinesweeperGame): MinesweeperResult {
  const time = game.startTime && game.endTime
    ? Math.floor((game.endTime.getTime() - game.startTime.getTime()) / 1000)
    : 0;

  // Score based on difficulty, time, and efficiency
  const difficultyMultiplier = {
    beginner: 1,
    intermediate: 2,
    expert: 3,
    custom: 1.5
  };

  const baseScore = game.config.rows * game.config.cols * difficultyMultiplier[game.config.difficulty];
  const timeBonus = Math.max(0, 300 - time) * 10; // Bonus for faster completion
  const efficiencyBonus = game.flagsUsed === game.config.mines ? 500 : 0; // Perfect flagging bonus

  const score = game.status === 'won'
    ? baseScore + timeBonus + efficiencyBonus
    : 0;

  return {
    won: game.status === 'won',
    time,
    score,
    gameId: game.gameId,
    config: game.config
  };
}

/**
 * Generate unique game ID
 */
function generateGameId(): string {
  return `minesweeper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get game statistics
 */
export function getMinesweeperStats(games: MinesweeperResult[]): {
  totalGames: number;
  winRate: number;
  averageTime: number;
  bestTime: number | null;
  currentStreak: number;
  bestStreak: number;
} {
  if (games.length === 0) {
    return {
      totalGames: 0,
      winRate: 0,
      averageTime: 0,
      bestTime: null,
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const wins = games.filter(g => g.won);
  const winRate = (wins.length / games.length) * 100;

  const totalTime = games.reduce((sum, g) => sum + g.time, 0);
  const averageTime = totalTime / games.length;

  const bestTime = wins.length > 0 ? Math.min(...wins.map(g => g.time)) : null;

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const game of games.slice().reverse()) {
    if (game.won) {
      tempStreak++;
      currentStreak = tempStreak;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    totalGames: games.length,
    winRate,
    averageTime,
    bestTime,
    currentStreak,
    bestStreak
  };
}