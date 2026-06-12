// Tower Stacker Game Core Logic
import { prisma } from '@/lib/api/prisma';
import { 
  generateTowerStackerColors,
  calculateBlockPosition,
  validateDrop,
  formatTowerStackerScore
} from "@/utility/games/tower-stacker";
import type {
  TowerStackerGameConfiguration,
  TowerStackerBlock,
  TowerStackerMove,
  TowerStackerGameSession,
  TowerStackerSessionRequest,
  TowerStackerValidation,
  TowerStackerScoreResult,
  TowerStackerRating,
  TowerStackerAchievement,
  TowerStackerPerformanceMetrics,
  TowerStackerScoreCalculation
} from '@/types/games/tower-stacker';

// Default game configuration
const DEFAULT_CONFIG: TowerStackerGameConfiguration = {
  initialWidth: 150,
  minWidth: 20,
  baseSpeed: 2.0,
  speedIncrement: 0.2,
  maxSpeed: 8.0,
  perfectDropThreshold: 0.95,
  colors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#A3CB38', '#FDA7DF', '#12CBC4', '#F79F1F', '#EE5A24'
  ],
  levelProgressionRules: {
    speedIncrease: 0.2,
    widthDecrease: 5,
    colorChange: true
  }
};

function mapToSession(dbSession: any): TowerStackerGameSession {
  const state = JSON.parse(dbSession.state || '{}');
  return {
    sessionId: dbSession.sessionId,
    userId: dbSession.userId || '',
    currentLevel: state.currentLevel ?? 1,
    maxLevel: state.maxLevel ?? 1,
    perfectDrops: state.perfectDrops ?? 0,
    totalDrops: state.totalDrops ?? 0,
    score: dbSession.score,
    gameState: (state.gameState || (dbSession.completed ? 'completed' : 'playing')) as 'playing' | 'completed' | 'failed',
    tower: state.tower || [],
    moves: state.moves || [],
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    totalTime: dbSession.duration || state.totalTime || 0,
    averageAccuracy: state.averageAccuracy || 0,
    bestStreak: state.bestStreak || 0,
    currentStreak: state.currentStreak || 0
  };
}

function addMoveToSession(sessionState: any, move: TowerStackerMove) {
  const moves: TowerStackerMove[] = sessionState.moves || [];
  moves.push(move);
  sessionState.moves = moves;

  sessionState.totalDrops = (sessionState.totalDrops || 0) + 1;
  if (move.perfectDrop) {
    sessionState.perfectDrops = (sessionState.perfectDrops || 0) + 1;
    sessionState.currentStreak = (sessionState.currentStreak || 0) + 1;
    sessionState.bestStreak = Math.max(sessionState.bestStreak || 0, sessionState.currentStreak);
  } else {
    sessionState.currentStreak = 0;
  }

  const totalAccuracy = moves.reduce((sum, m) => sum + m.accuracy, 0);
  sessionState.averageAccuracy = totalAccuracy / moves.length;
}

/**
 * Create a new Tower Stacker game session
 */
export async function createTowerStackerSession(
  request: TowerStackerSessionRequest
): Promise<TowerStackerGameSession> {
  const { userId, difficulty = 'beginner', configuration } = request;
  
  const config = { ...DEFAULT_CONFIG, ...configuration };
  
  // Generate initial block
  const initialBlock = generateInitialBlock(1, config);
  
  const state = {
    currentLevel: 1,
    maxLevel: 1,
    perfectDrops: 0,
    totalDrops: 0,
    gameState: 'playing',
    tower: [initialBlock],
    moves: [],
    totalTime: 0,
    averageAccuracy: 0,
    bestStreak: 0,
    currentStreak: 0
  };
  
  // Save to database
  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId: `ts_${userId || 'guest'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      game: 'tower-stacker',
      difficulty,
      state: JSON.stringify(state),
      startedAt: new Date(),
      completed: false,
      score: 0
    }
  });
  
  return mapToSession(session);
}

/**
 * Generate initial block for tower
 */
export function generateInitialBlock(level: number, config: TowerStackerGameConfiguration): TowerStackerBlock {
  const colors = generateTowerStackerColors(config.colors);
  
  return {
    id: `block_${level}_${Date.now()}`,
    width: config.initialWidth,
    position: 0, // Centered
    speed: config.baseSpeed,
    direction: Math.random() > 0.5 ? 'left' : 'right',
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

/**
 * Generate next block in tower
 */
export function generateNextBlock(
  level: number, 
  previousBlock: TowerStackerBlock,
  config: TowerStackerGameConfiguration
): TowerStackerBlock {
  const colors = generateTowerStackerColors(config.colors);
  
  // Calculate new width (slightly smaller each level)
  const widthReduction = Math.max(
    0, 
    Math.floor((level - 1) * config.levelProgressionRules.widthDecrease)
  );
  const newWidth = Math.max(
    config.minWidth,
    previousBlock.width - widthReduction
  );
  
  // Calculate new speed (faster each level)
  const speedIncrease = (level - 1) * config.levelProgressionRules.speedIncrease;
  const newSpeed = Math.min(
    config.maxSpeed,
    config.baseSpeed + speedIncrease
  );
  
  // Random starting position and direction
  const direction = Math.random() > 0.5 ? 'left' : 'right';
  const startPosition = direction === 'left' ? -100 : 100;
  
  return {
    id: `block_${level}_${Date.now()}`,
    width: newWidth,
    position: startPosition,
    speed: newSpeed,
    direction,
    color: colors[level % colors.length]
  };
}

/**
 * Process a block drop
 */
export async function processBlockDrop(
  sessionId: string,
  dropPosition: number,
  reactionTime: number
): Promise<{
  success: boolean;
  validation: TowerStackerValidation;
  newBlock?: TowerStackerBlock;
  gameComplete?: boolean;
  gameOver?: boolean;
  session: TowerStackerGameSession;
}> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    throw new Error("Session not found");
  }
  
  const state = JSON.parse(session.state || '{}');
  if (state.gameState !== 'playing') {
    throw new Error("Game is not active");
  }
  
  const tower = state.tower || [];
  const currentBlock = tower[tower.length - 1];
  const previousBlock = tower.length > 1 ? tower[tower.length - 2] : null;
  
  // Validate the drop
  const validation = validateDrop(currentBlock, previousBlock, dropPosition);
  
  // Create move record
  const move: TowerStackerMove = {
    level: state.currentLevel || 1,
    dropPosition,
    targetPosition: previousBlock?.position || 0,
    accuracy: validation.accuracy,
    perfectDrop: validation.isPerfect,
    blockWidth: validation.newWidth,
    timestamp: new Date(),
    timeTaken: reactionTime
  };
  
  // Update session
  addMoveToSession(state, move);
  
  let result: any = {
    success: true,
    validation
  };
  
  let completed = session.completed;
  let completedAt = session.completedAt;
  let score = session.score;

  // Check if game should continue
  if (validation.canContinue) {
    // Update current block width & position
    currentBlock.width = validation.newWidth;
    currentBlock.position = dropPosition;
    
    // Check if reached max level (20)
    if (state.currentLevel >= 20) {
      state.gameState = 'completed';
      completed = true;
      completedAt = new Date();
      
      const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);
      const scoreResult = await calculateTowerStackerScore({
        level: state.currentLevel,
        perfectDrops: state.perfectDrops,
        totalDrops: state.totalDrops,
        averageAccuracy: state.averageAccuracy,
        completionTime: duration,
        userId: session.userId || undefined
      });
      score = scoreResult.score;
      result.gameComplete = true;
    } else {
      // Generate next block
      state.currentLevel = (state.currentLevel || 1) + 1;
      state.maxLevel = Math.max(state.maxLevel || 1, state.currentLevel);
      
      const nextBlock = generateNextBlock(state.currentLevel, currentBlock, DEFAULT_CONFIG);
      tower.push(nextBlock);
      
      result.newBlock = nextBlock;
    }
  } else {
    // Game over - block too small to continue or missed previous block
    state.gameState = 'failed';
    completed = true;
    completedAt = new Date();
    
    const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);
    const scoreResult = await calculateTowerStackerScore({
      level: state.currentLevel,
      perfectDrops: state.perfectDrops,
      totalDrops: state.totalDrops,
      averageAccuracy: state.averageAccuracy,
      completionTime: duration,
      userId: session.userId || undefined
    });
    score = scoreResult.score;
    result.gameOver = true;
  }
  
  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state),
      completed,
      completedAt,
      score,
      duration: completedAt ? Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000) : undefined
    }
  });

  result.session = mapToSession(updatedSession);
  
  return result;
}

/**
 * Calculate comprehensive score for Tower Stacker game
 */
export async function calculateTowerStackerScore(params: {
  level: number;
  perfectDrops: number;
  totalDrops: number;
  averageAccuracy: number;
  completionTime?: number;
  userId?: string;
}): Promise<TowerStackerScoreResult> {
  const { level, perfectDrops, totalDrops, averageAccuracy, completionTime, userId } = params;
  
  // Base score calculation
  const baseScore = level * 10;
  
  // Perfect drops bonus (20 points each)
  const perfectDropsBonus = perfectDrops * 20;
  
  // Accuracy bonus (up to 100 points)
  const accuracyBonus = Math.floor(averageAccuracy * 100);
  
  // Completion bonus (level-based)
  let completionBonus = 0;
  if (level >= 20) {
    completionBonus = 200; // Complete win bonus
  } else if (level >= 15) {
    completionBonus = 150;
  } else if (level >= 10) {
    completionBonus = 100;
  } else if (level >= 5) {
    completionBonus = 50;
  }
  
  // Speed bonus
  let speedBonus = 0;
  if (completionTime && level >= 20) {
    const targetTime = 120;
    if (completionTime < targetTime) {
      speedBonus = Math.floor((targetTime - completionTime) / 2);
    }
  }
  
  // Streak bonus
  const streakBonus = Math.floor(perfectDrops * 1.5);
  
  // Total score calculation
  const totalScore = baseScore + perfectDropsBonus + accuracyBonus + completionBonus + speedBonus + streakBonus;
  
  const scoreCalculation: TowerStackerScoreCalculation = {
    level,
    perfectDrops,
    totalDrops,
    averageAccuracy,
    completionBonus,
    accuracyBonus,
    speedBonus,
    streakBonus,
    totalScore
  };
  
  // Determine rating
  const rating = getTowerStackerRating(level, perfectDrops, averageAccuracy);
  
  // Generate message
  const message = getTowerStackerMessage(level, perfectDrops, averageAccuracy);
  
  // Check for achievements
  const achievements = await checkTowerStackerAchievements(params, userId);
  
  return {
    score: totalScore,
    rating,
    message,
    breakdown: scoreCalculation,
    achievements
  };
}

/**
 * Get rating based on performance
 */
export function getTowerStackerRating(
  level: number, 
  perfectDrops: number = 0, 
  averageAccuracy: number = 0
): TowerStackerRating {
  if (level >= 20 && perfectDrops >= 18 && averageAccuracy >= 0.95) {
    return 'Perfect Architect';
  }
  
  if (level >= 20) {
    return 'Tower Master';
  }
  
  if (level >= 15 && averageAccuracy >= 0.8) {
    return 'Sky Scraper Builder';
  }
  
  if (level >= 15 || (level >= 10 && averageAccuracy >= 0.85)) {
    return 'Excellent';
  }
  
  if (level >= 10 || (level >= 5 && averageAccuracy >= 0.8)) {
    return 'Great';
  }
  
  if (level >= 5 || averageAccuracy >= 0.7) {
    return 'Good';
  }
  
  return 'Beginner';
}

/**
 * Generate message based on performance
 */
export function getTowerStackerMessage(
  level: number, 
  perfectDrops: number = 0, 
  averageAccuracy: number = 0
): string {
  if (level >= 20) {
    return "Perfect! You built a complete tower!";
  }
  
  if (perfectDrops >= 15) {
    return "Amazing accuracy! Master builder skills!";
  }
  
  if (perfectDrops >= 10) {
    return "Excellent precision! Keep it up!";
  }
  
  if (level >= 15) {
    return "So close to perfection! Almost there!";
  }
  
  if (level >= 10) {
    return "Great balance and timing!";
  }
  
  if (averageAccuracy >= 0.8) {
    return "Impressive accuracy! Well done!";
  }
  
  if (level >= 5) {
    return "Good progress! Keep building!";
  }
  
  return "Keep practicing your timing!";
}

/**
 * Check for achievements based on performance
 */
export async function checkTowerStackerAchievements(
  params: {
    level: number;
    perfectDrops: number;
    totalDrops: number;
    averageAccuracy: number;
  },
  userId?: string
): Promise<TowerStackerAchievement[]> {
  const { level, perfectDrops, averageAccuracy } = params;
  const achievements: TowerStackerAchievement[] = [];
  
  const achievementDefinitions = [
    {
      id: 'first_tower',
      name: 'First Tower',
      description: 'Complete your first 5 levels',
      condition: 'level >= 5',
      check: () => level >= 5
    },
    {
      id: 'halfway_there',
      name: 'Halfway There',
      description: 'Reach level 10',
      condition: 'level >= 10',
      check: () => level >= 10
    },
    {
      id: 'almost_perfect',
      name: 'Almost Perfect',
      description: 'Reach level 15',
      condition: 'level >= 15',
      check: () => level >= 15
    },
    {
      id: 'tower_master',
      name: 'Tower Master',
      description: 'Complete all 20 levels',
      condition: 'level >= 20',
      check: () => level >= 20
    },
    {
      id: 'perfect_aim',
      name: 'Perfect Aim',
      description: 'Achieve 5 perfect drops in a row',
      condition: 'perfectDrops >= 5',
      check: () => perfectDrops >= 5
    },
    {
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Achieve 10 perfect drops',
      condition: 'perfectDrops >= 10',
      check: () => perfectDrops >= 10
    },
    {
      id: 'precision_master',
      name: 'Precision Master',
      description: 'Maintain 90%+ accuracy',
      condition: 'averageAccuracy >= 0.9',
      check: () => averageAccuracy >= 0.9
    },
    {
      id: 'perfect_game',
      name: 'Perfect Game',
      description: 'Complete the tower with 95%+ accuracy',
      condition: 'level >= 20 && averageAccuracy >= 0.95',
      check: () => level >= 20 && averageAccuracy >= 0.95
    }
  ];
  
  for (const def of achievementDefinitions) {
    if (def.check()) {
      achievements.push({
        id: def.id,
        name: def.name,
        description: def.description,
        condition: def.condition,
        unlocked: true,
        unlockedAt: new Date()
      });
    }
  }
  
  return achievements;
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(session: TowerStackerGameSession): TowerStackerPerformanceMetrics {
  const { moves, perfectDrops, totalDrops, averageAccuracy, maxLevel } = session;
  
  const reactionTime = moves.length > 0 
    ? moves.reduce((sum, move) => sum + move.timeTaken, 0) / moves.length 
    : 0;
  
  const precision = averageAccuracy;
  
  let consistency = 1.0;
  if (moves.length > 1) {
    const accuracyValues = moves.map(m => m.accuracy);
    const mean = accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length;
    const variance = accuracyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / accuracyValues.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, 1 - stdDev);
  }
  
  const progression = maxLevel / 20;
  
  const efficiency = totalDrops > 0 ? perfectDrops / totalDrops : 0;
  
  const overallRating = (
    precision * 0.3 +
    consistency * 0.2 +
    progression * 0.25 +
    efficiency * 0.25
  );
  
  return {
    reactionTime: Math.round(reactionTime),
    precision: Math.round(precision * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    progression: Math.round(progression * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    overallRating: Math.round(overallRating * 100) / 100
  };
}