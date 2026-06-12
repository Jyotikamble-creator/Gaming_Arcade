import type { 
  SimonColor, 
  ISimonSession, 
  ISimonGameState, 
  ISimonConfig,
  SimonStartRequest,
  ISimonStats
} from '@/types/games/simon';
import { generateUniqueId } from '@/utility/games/simon';

/**
 * Default Simon game colors
 */
export const DEFAULT_SIMON_COLORS: SimonColor[] = [
  'red',
  'blue', 
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'cyan'
];

/**
 * Get Simon game colors
 * @returns Array of available colors
 */
export function getSimonColors(): SimonColor[] {
  return DEFAULT_SIMON_COLORS;
}

/**
 * Create a new Simon game session
 * @param options - Session configuration options
 * @returns New Simon session
 */
export function createSimonSession(options: SimonStartRequest = {}): ISimonSession {
  const colors = getSimonColors();
  const seed = Date.now();
  const sessionId = generateUniqueId();
  
  return {
    colors,
    seed,
    sessionId,
    startTime: new Date()
  };
}

/**
 * Initialize Simon game state
 * @param colors - Available colors for the game
 * @returns Initial game state
 */
export function initializeSimonGameState(colors: SimonColor[]): ISimonGameState {
  return {
    sequence: [],
    currentStep: 0,
    playerSequence: [],
    isGameActive: true,
    level: 1,
    score: 0
  };
}

/**
 * Generate next sequence for Simon game
 * @param currentSequence - Current sequence
 * @param colors - Available colors
 * @param seed - Random seed for consistency
 * @returns Updated sequence
 */
export function generateNextSequence(
  currentSequence: SimonColor[], 
  colors: SimonColor[], 
  seed: number
): SimonColor[] {
  // Use seed to make sequence deterministic for replay
  const seededRandom = (seed + currentSequence.length) % colors.length;
  const nextColor = colors[seededRandom];
  
  return [...currentSequence, nextColor];
}

/**
 * Validate player move in Simon game
 * @param playerMove - Color selected by player
 * @param expectedColor - Expected color in sequence
 * @param step - Current step in sequence
 * @returns Validation result
 */
export function validateSimonMove(
  playerMove: SimonColor,
  expectedColor: SimonColor,
  step: number
): boolean {
  return playerMove === expectedColor;
}

/**
 * Calculate Simon game score
 * @param level - Current level
 * @param accuracy - Move accuracy percentage
 * @param timeBonus - Time bonus multiplier
 * @returns Calculated score
 */
export function calculateSimonScore(
  level: number,
  accuracy: number = 100,
  timeBonus: number = 1
): number {
  const baseScore = level * 10;
  const accuracyMultiplier = accuracy / 100;
  const finalScore = Math.round(baseScore * accuracyMultiplier * timeBonus);
  
  return Math.max(finalScore, 0);
}

/**
 * Update Simon game state after player move
 * @param gameState - Current game state
 * @param playerMove - Player's move
 * @param sequence - Target sequence
 * @returns Updated game state
 */
export function updateSimonGameState(
  gameState: ISimonGameState,
  playerMove: SimonColor,
  sequence: SimonColor[]
): ISimonGameState {
  const isCorrect = validateSimonMove(
    playerMove,
    sequence[gameState.currentStep],
    gameState.currentStep
  );

  if (!isCorrect) {
    return {
      ...gameState,
      isGameActive: false,
      playerSequence: [...gameState.playerSequence, playerMove]
    };
  }

  const newPlayerSequence = [...gameState.playerSequence, playerMove];
  const newStep = gameState.currentStep + 1;
  
  // Check if sequence is complete
  if (newStep >= sequence.length) {
    // Level complete - advance to next level
    const newLevel = gameState.level + 1;
    const newScore = calculateSimonScore(newLevel, 100);
    
    return {
      sequence: [],
      currentStep: 0,
      playerSequence: [],
      isGameActive: true,
      level: newLevel,
      score: gameState.score + newScore
    };
  }

  return {
    ...gameState,
    currentStep: newStep,
    playerSequence: newPlayerSequence
  };
}

/**
 * Get Simon game configuration based on difficulty
 * @param difficulty - Game difficulty level
 * @returns Game configuration
 */
export function getSimonConfig(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): ISimonConfig {
  const configs = {
    easy: {
      colors: DEFAULT_SIMON_COLORS.slice(0, 4), // Only 4 colors
      maxLevel: 10,
      sequenceSpeed: 800 // Slower
    },
    medium: {
      colors: DEFAULT_SIMON_COLORS.slice(0, 6), // 6 colors
      maxLevel: 20,
      sequenceSpeed: 600 // Medium
    },
    hard: {
      colors: DEFAULT_SIMON_COLORS, // All 8 colors
      maxLevel: 50,
      sequenceSpeed: 400 // Faster
    }
  };

  return configs[difficulty];
}