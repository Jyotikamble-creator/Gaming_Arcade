import type { 
  SlidingPuzzleDifficulty,
  SlidingPuzzleRating,
  ISlidingPuzzleStats
} from '@/types/games/sliding-puzzle';

/**
 * Generate a unique session ID for sliding puzzle
 * @returns Unique identifier string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `sliding_${timestamp}_${random}`;
}

/**
 * Calculate move efficiency percentage
 * @param moves - Number of moves taken
 * @returns Efficiency percentage (0-100)
 */
export function calculateMoveEfficiency(moves: number): number {
  const optimalMoves = 80; // Considered optimal for 4x4 puzzle
  const efficiency = Math.round((optimalMoves / Math.max(moves, 1)) * 100);
  return Math.min(efficiency, 100);
}

/**
 * Calculate time efficiency percentage
 * @param timeElapsed - Time taken in seconds
 * @returns Efficiency percentage (0-100)
 */
export function calculateTimeEfficiency(timeElapsed: number): number {
  const optimalTime = 120; // 2 minutes considered optimal
  const efficiency = Math.round((optimalTime / Math.max(timeElapsed, 1)) * 100);
  return Math.min(efficiency, 100);
}

/**
 * Get rating based on efficiency metrics
 * @param moveEfficiency - Move efficiency percentage
 * @param timeEfficiency - Time efficiency percentage
 * @returns Performance rating
 */
export function getRatingFromEfficiency(
  moveEfficiency: number,
  timeEfficiency: number
): SlidingPuzzleRating {
  const totalEfficiency = moveEfficiency + timeEfficiency;
  
  if (totalEfficiency >= 180) return 'Puzzle Master';
  if (totalEfficiency >= 140) return 'Expert';
  if (totalEfficiency >= 100) return 'Advanced';
  if (totalEfficiency >= 60) return 'Intermediate';
  return 'Beginner';
}

/**
 * Get performance message based on moves and time
 * @param moves - Number of moves taken
 * @param timeElapsed - Time taken in seconds
 * @returns Encouraging performance message
 */
export function getPerformanceMessage(moves: number, timeElapsed: number): string {
  if (moves <= 80 && timeElapsed <= 180) {
    return "Outstanding! You solved it efficiently and quickly!";
  }
  if (moves <= 100) {
    return "Great job! You found an efficient solution!";
  }
  if (timeElapsed <= 240) {
    return "Well done! You solved it quickly!";
  }
  if (moves <= 150) {
    return "Good work! You completed the puzzle!";
  }
  return "Nice try! Keep practicing to improve your efficiency!";
}

/**
 * Format time duration in human readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
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
 * @returns CSS color class or hex color
 */
export function getDifficultyColor(difficulty: SlidingPuzzleDifficulty): string {
  const colors = {
    beginner: '#22C55E', // Green
    intermediate: '#3B82F6', // Blue
    advanced: '#F59E0B', // Amber
    expert: '#EF4444', // Red
    master: '#8B5CF6' // Purple
  };
  
  return colors[difficulty];
}

/**
 * Get difficulty emoji for display
 * @param difficulty - Difficulty level
 * @returns Emoji representing difficulty
 */
export function getDifficultyEmoji(difficulty: SlidingPuzzleDifficulty): string {
  const emojis = {
    beginner: '🟢',
    intermediate: '🔵',
    advanced: '🟡',
    expert: '🔴',
    master: '🟣'
  };
  
  return emojis[difficulty];
}

/**
 * Get rating emoji for display
 * @param rating - Performance rating
 * @returns Emoji representing rating
 */
export function getRatingEmoji(rating: SlidingPuzzleRating): string {
  const emojis = {
    'Beginner': '🌱',
    'Intermediate': '🌿',
    'Advanced': '🌳',
    'Expert': '🏆',
    'Puzzle Master': '👑'
  };
  
  return emojis[rating];
}

/**
 * Validate puzzle size
 * @param size - Puzzle grid size
 * @returns True if valid size
 */
export function isValidPuzzleSize(size: number): boolean {
  return size >= 3 && size <= 6;
}

/**
 * Get minimum moves for optimal solution (estimated)
 * @param puzzleSize - Size of the puzzle
 * @returns Estimated minimum moves
 */
export function getOptimalMoves(puzzleSize: number): number {
  const estimates = {
    3: 22,   // 3x3 puzzle
    4: 80,   // 4x4 puzzle
    5: 150,  // 5x5 puzzle
    6: 250   // 6x6 puzzle
  };
  
  return estimates[puzzleSize as keyof typeof estimates] || 80;
}

/**
 * Convert linear index to 2D coordinates
 * @param index - Linear array index
 * @param size - Grid size
 * @returns Object with row and col coordinates
 */
export function indexToCoords(index: number, size: number): { row: number; col: number } {
  return {
    row: Math.floor(index / size),
    col: index % size
  };
}

/**
 * Convert 2D coordinates to linear index
 * @param row - Row coordinate
 * @param col - Column coordinate
 * @param size - Grid size
 * @returns Linear array index
 */
export function coordsToIndex(row: number, col: number, size: number): number {
  return row * size + col;
}

/**
 * Check if two positions are adjacent
 * @param pos1 - First position index
 * @param pos2 - Second position index
 * @param size - Grid size
 * @returns True if positions are adjacent
 */
export function arePositionsAdjacent(pos1: number, pos2: number, size: number): boolean {
  const coords1 = indexToCoords(pos1, size);
  const coords2 = indexToCoords(pos2, size);
  
  const rowDiff = Math.abs(coords1.row - coords2.row);
  const colDiff = Math.abs(coords1.col - coords2.col);
  
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Calculate inversion count to check solvability
 * @param puzzle - Puzzle state array
 * @returns Number of inversions
 */
export function countInversions(puzzle: number[]): number {
  let inversions = 0;
  const filtered = puzzle.filter(tile => tile !== 0);
  
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) {
        inversions++;
      }
    }
  }
  
  return inversions;
}

/**
 * Check if puzzle state is solvable
 * @param puzzle - Puzzle state array
 * @param size - Grid size
 * @returns True if solvable
 */
export function isPuzzleSolvable(puzzle: number[], size: number): boolean {
  const inversions = countInversions(puzzle);
  const emptyRowFromBottom = size - Math.floor(puzzle.indexOf(0) / size);
  
  if (size % 2 === 1) {
    // Odd grid: even number of inversions means solvable
    return inversions % 2 === 0;
  } else {
    // Even grid: complex rules based on empty tile position
    if (emptyRowFromBottom % 2 === 0) {
      return inversions % 2 === 1;
    } else {
      return inversions % 2 === 0;
    }
  }
}

/**
 * Generate random solvable puzzle
 * @param size - Grid size
 * @param shuffleMoves - Number of moves to shuffle
 * @returns Solvable puzzle state
 */
export function generateRandomPuzzle(size: number, shuffleMoves: number = 100): number[] {
  const totalTiles = size * size;
  let puzzle = Array.from({ length: totalTiles }, (_, i) => i);
  
  // Shuffle using valid moves to ensure solvability
  for (let i = 0; i < shuffleMoves; i++) {
    const emptyIndex = puzzle.indexOf(0);
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;
    const validMoves: number[] = [];
    
    // Get adjacent positions
    if (row > 0) validMoves.push((row - 1) * size + col);
    if (row < size - 1) validMoves.push((row + 1) * size + col);
    if (col > 0) validMoves.push(row * size + (col - 1));
    if (col < size - 1) validMoves.push(row * size + (col + 1));
    
    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [puzzle[emptyIndex], puzzle[randomMove]] = [puzzle[randomMove], puzzle[emptyIndex]];
    }
  }
  
  return puzzle;
}

/**
 * Get hint for next best move
 * @param currentState - Current puzzle state
 * @param size - Grid size
 * @returns Suggested move position or null
 */
export function getHint(currentState: number[], size: number): number | null {
  const emptyIndex = currentState.indexOf(0);
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  const validMoves: number[] = [];
  
  // Get all valid moves
  if (row > 0) validMoves.push((row - 1) * size + col);
  if (row < size - 1) validMoves.push((row + 1) * size + col);
  if (col > 0) validMoves.push(row * size + (col - 1));
  if (col < size - 1) validMoves.push(row * size + (col + 1));
  
  if (validMoves.length === 0) return null;
  
  // Simple heuristic: move tile that's closest to its target position
  let bestMove = validMoves[0];
  let bestScore = Infinity;
  
  for (const move of validMoves) {
    const tile = currentState[move];
    if (tile === 0) continue;
    
    const currentPos = indexToCoords(move, size);
    const targetPos = indexToCoords(tile, size);
    const distance = Math.abs(currentPos.row - targetPos.row) + Math.abs(currentPos.col - targetPos.col);
    
    if (distance < bestScore) {
      bestScore = distance;
      bestMove = move;
    }
  }
  
  return bestMove;
}