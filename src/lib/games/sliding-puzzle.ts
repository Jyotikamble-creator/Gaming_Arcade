import type { 
  ISlidingPuzzleBenchmarks,
  SlidingPuzzleDifficulty,
  SlidingPuzzleRating,
  SlidingPuzzleScoreRequest,
  SlidingPuzzleScoreResponse,
  ISlidingPuzzleSession,
  ISlidingPuzzleValidation,
  ISlidingPuzzleConfig
} from '@/types/games/sliding-puzzle';
import { 
  generateUniqueId,
  getRatingFromEfficiency,
  getPerformanceMessage,
  calculateMoveEfficiency,
  calculateTimeEfficiency
} from '@/utility/games/sliding-puzzle';

/**
 * Get sliding puzzle difficulty benchmarks
 * @returns Benchmark configuration for all difficulty levels
 */
export function getSlidingPuzzleBenchmarks(): ISlidingPuzzleBenchmarks {
  return {
    beginner: { minMoves: 150, maxMoves: 300, maxTime: 600 },
    intermediate: { minMoves: 100, maxMoves: 149, maxTime: 450 },
    advanced: { minMoves: 80, maxMoves: 99, maxTime: 300 },
    expert: { minMoves: 60, maxMoves: 79, maxTime: 240 },
    master: { minMoves: 40, maxMoves: 59, maxTime: 180 }
  };
}

/**
 * Calculate sliding puzzle score based on performance
 * @param request - Score calculation parameters
 * @returns Score, rating, and performance breakdown
 */
export function calculateSlidingPuzzleScore(request: SlidingPuzzleScoreRequest): SlidingPuzzleScoreResponse {
  const { moves, timeElapsed, difficulty = 'intermediate', puzzleSize = 4 } = request;

  // Base score calculation
  let baseScore = 1000;

  // Move efficiency bonus (fewer moves = higher score)
  const moveBonus = Math.max(0, 200 - moves * 2);
  
  // Time bonus (faster completion = higher score)
  const timeBonus = Math.max(0, 300 - timeElapsed);
  
  // Perfect solve bonus
  const perfectSolveBonus = moves <= 80 ? 100 : 0;
  
  // Speed demon bonus (under 2 minutes)
  const speedBonus = timeElapsed <= 120 ? 50 : 0;

  // Calculate final score
  const totalScore = Math.max(50, baseScore + moveBonus + timeBonus + perfectSolveBonus + speedBonus);

  // Calculate efficiency metrics
  const moveEfficiency = calculateMoveEfficiency(moves);
  const timeEfficiency = calculateTimeEfficiency(timeElapsed);

  // Get rating and message
  const rating = getRatingFromEfficiency(moveEfficiency, timeEfficiency);
  const message = getPerformanceMessage(moves, timeElapsed);

  return {
    score: totalScore,
    rating,
    message,
    stats: {
      moveEfficiency,
      timeEfficiency
    },
    breakdown: {
      baseScore,
      moveBonus,
      timeBonus,
      perfectSolveBonus: perfectSolveBonus > 0 ? perfectSolveBonus : undefined,
      speedBonus: speedBonus > 0 ? speedBonus : undefined
    }
  };
}

/**
 * Create a new sliding puzzle session
 * @param config - Game configuration
 * @param userId - Optional user ID
 * @param playerName - Optional player name
 * @returns New game session
 */
export function createSlidingPuzzleSession(
  config: ISlidingPuzzleConfig,
  userId?: string,
  playerName?: string
): ISlidingPuzzleSession {
  const sessionId = generateUniqueId();
  const puzzleSize = config.size;
  const totalTiles = puzzleSize * puzzleSize;
  
  // Create solved state
  const solvedState = Array.from({ length: totalTiles }, (_, i) => i);
  
  // Create initial shuffled state
  const initialState = shufflePuzzle(solvedState, config.shuffleMoves || 100);

  return {
    sessionId,
    userId,
    playerName,
    difficulty: config.difficulty,
    puzzleSize,
    initialState,
    currentState: [...initialState],
    moves: 0,
    startTime: new Date(),
    isCompleted: false
  };
}

/**
 * Validate puzzle state and check if solved
 * @param currentState - Current puzzle state
 * @param puzzleSize - Size of the puzzle
 * @returns Validation result
 */
export function validatePuzzleState(
  currentState: number[],
  puzzleSize: number
): ISlidingPuzzleValidation {
  const totalTiles = puzzleSize * puzzleSize;
  const solvedState = Array.from({ length: totalTiles }, (_, i) => i);
  
  // Check if puzzle is solved
  const isSolved = currentState.every((tile, index) => tile === solvedState[index]);
  
  // Find empty space (represented by 0)
  const emptyIndex = currentState.indexOf(0);
  const nextMoves = getValidMoves(emptyIndex, puzzleSize);

  return {
    isValid: currentState.length === totalTiles,
    isSolved,
    nextMoves
  };
}

/**
 * Get valid moves from current position
 * @param emptyIndex - Index of empty space
 * @param puzzleSize - Size of the puzzle
 * @returns Array of valid move positions
 */
export function getValidMoves(emptyIndex: number, puzzleSize: number): number[] {
  const row = Math.floor(emptyIndex / puzzleSize);
  const col = emptyIndex % puzzleSize;
  const validMoves: number[] = [];

  // Up
  if (row > 0) validMoves.push((row - 1) * puzzleSize + col);
  // Down
  if (row < puzzleSize - 1) validMoves.push((row + 1) * puzzleSize + col);
  // Left
  if (col > 0) validMoves.push(row * puzzleSize + (col - 1));
  // Right
  if (col < puzzleSize - 1) validMoves.push(row * puzzleSize + (col + 1));

  return validMoves;
}

/**
 * Execute a move in the puzzle
 * @param currentState - Current puzzle state
 * @param movePosition - Position to move tile from
 * @returns Updated puzzle state or null if invalid move
 */
export function executePuzzleMove(
  currentState: number[],
  movePosition: number
): number[] | null {
  const puzzleSize = Math.sqrt(currentState.length);
  const emptyIndex = currentState.indexOf(0);
  const validMoves = getValidMoves(emptyIndex, puzzleSize);

  if (!validMoves.includes(movePosition)) {
    return null; // Invalid move
  }

  // Create new state with move executed
  const newState = [...currentState];
  [newState[emptyIndex], newState[movePosition]] = [newState[movePosition], newState[emptyIndex]];

  return newState;
}

/**
 * Shuffle puzzle state randomly
 * @param solvedState - Solved puzzle state
 * @param shuffleMoves - Number of random moves to make
 * @returns Shuffled puzzle state
 */
function shufflePuzzle(solvedState: number[], shuffleMoves: number): number[] {
  let currentState = [...solvedState];
  const puzzleSize = Math.sqrt(currentState.length);

  for (let i = 0; i < shuffleMoves; i++) {
    const emptyIndex = currentState.indexOf(0);
    const validMoves = getValidMoves(emptyIndex, puzzleSize);
    
    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      const newState = executePuzzleMove(currentState, randomMove);
      if (newState) {
        currentState = newState;
      }
    }
  }

  return currentState;
}

/**
 * Get puzzle difficulty based on moves and time
 * @param moves - Number of moves taken
 * @param timeElapsed - Time taken in seconds
 * @returns Suggested difficulty level
 */
export function getDifficultyFromPerformance(
  moves: number,
  timeElapsed: number
): SlidingPuzzleDifficulty {
  const benchmarks = getSlidingPuzzleBenchmarks();
  
  for (const [difficulty, benchmark] of Object.entries(benchmarks)) {
    if (moves >= benchmark.minMoves && moves <= benchmark.maxMoves && timeElapsed <= benchmark.maxTime) {
      return difficulty as SlidingPuzzleDifficulty;
    }
  }

  // Default fallback
  if (moves > 300 || timeElapsed > 600) return 'beginner';
  if (moves < 40 && timeElapsed < 180) return 'master';
  return 'intermediate';
}

/**
 * Calculate manhattan distance for puzzle heuristic
 * @param currentState - Current puzzle state
 * @param puzzleSize - Size of the puzzle
 * @returns Manhattan distance from solved state
 */
export function calculateManhattanDistance(
  currentState: number[],
  puzzleSize: number
): number {
  let distance = 0;

  for (let i = 0; i < currentState.length; i++) {
    const tile = currentState[i];
    if (tile === 0) continue; // Skip empty space

    const currentRow = Math.floor(i / puzzleSize);
    const currentCol = i % puzzleSize;
    const targetRow = Math.floor(tile / puzzleSize);
    const targetCol = tile % puzzleSize;

    distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
  }

  return distance;
}