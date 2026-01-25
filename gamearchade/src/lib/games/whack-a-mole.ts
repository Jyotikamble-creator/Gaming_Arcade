// Whack-a-Mole Game Core Logic
import {
  WhackGameSession,
  WhackStartRequest,
  WhackGameConfiguration,
  WhackMole,
  WhackMoleType,
  WhackMolePosition,
  WhackMoleHit,
  WhackPowerUp,
  WhackSessionResult,
  WhackGameStatistics,
  WhackPerformanceMetrics,
  WhackAchievement,
  WhackGameSettings,
  WhackDifficulty,
  WhackGameMode,
  WhackGrade,
  WhackRank
} from "@/types/games/whack-a-mole";
import { WhackSession } from "@/models/games/whack-a-mole";
import { 
  generateMoleId, 
  calculateMolePoints, 
  getRandomMoleType,
  getMoleColors,
  validateHitAccuracy 
} from "@/utility/games/whack-a-mole";

// Game configuration
const GAME_CONFIG: WhackGameConfiguration = {
  gridSizes: {
    easy: 9,      // 3x3
    normal: 9,    // 3x3
    hard: 16,     // 4x4
    expert: 25,   // 5x5
    insane: 36    // 6x6
  },
  durations: {
    classic: 30,
    arcade: 60,
    zen: 120,
    survival: 180,
    'time-attack': 45,
    precision: 30,
    endurance: 300,
    chaos: 90
  },
  spawnRates: {
    easy: 1500,    // milliseconds between spawns
    normal: 1200,
    hard: 1000,
    expert: 800,
    insane: 600
  },
  moleVisibilityTime: {
    easy: 2000,    // milliseconds visible
    normal: 1500,
    hard: 1200,
    expert: 1000,
    insane: 800
  },
  maxSimultaneousMoles: {
    easy: 1,
    normal: 2,
    hard: 3,
    expert: 4,
    insane: 5
  },
  pointValues: {
    normal: 10,
    fast: 15,
    slow: 8,
    bonus: 25,
    golden: 50,
    bomb: -20,
    freeze: 30,
    double: 20,
    giant: 5,
    mini: 40
  },
  powerUpFrequency: 0.1,      // 10% chance
  specialMoleFrequency: 0.2   // 20% chance
};

// Default settings
const DEFAULT_SETTINGS: WhackGameSettings = {
  soundEnabled: true,
  vibrationEnabled: false,
  showReactionTime: true,
  showStreakCounter: true,
  showComboMultiplier: true,
  highlightMoles: true,
  difficulty: 'normal',
  gameMode: 'classic',
  enablePowerUps: true,
  enableSpecialMoles: true,
  autoRestart: false
};

/**
 * Get game configuration
 */
export function getWhackGameConfiguration(): WhackGameConfiguration {
  return GAME_CONFIG;
}

/**
 * Create a new Whack-a-Mole game session
 */
export async function createWhackGameSession(request: WhackStartRequest): Promise<WhackGameSession> {
  const { userId, gameMode = 'classic', difficulty = 'normal', customSettings } = request;
  
  const gridSize = GAME_CONFIG.gridSizes[difficulty];
  const duration = GAME_CONFIG.durations[gameMode];
  const settings = { ...DEFAULT_SETTINGS, ...customSettings };
  
  // Initialize power-ups if enabled
  const powerUps: WhackPowerUp[] = [];
  if (settings.enablePowerUps) {
    powerUps.push(...generateInitialPowerUps());
  }
  
  const session: WhackGameSession = {
    sessionId: `whack_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    gameMode,
    difficulty,
    gridSize,
    duration,
    startTime: new Date(),
    isActive: true,
    isPaused: false,
    pausedTime: 0,
    currentScore: 0,
    molesSpawned: 0,
    molesHit: 0,
    molesMissed: 0,
    perfectHits: 0,
    streakCurrent: 0,
    streakBest: 0,
    comboMultiplier: 1,
    totalReactionTime: 0,
    fastestReaction: 0,
    slowestReaction: 0,
    powerUpsUsed: 0,
    specialMolesHit: 0,
    moleHistory: [],
    powerUps,
    settings,
    statistics: {
      accuracy: 0,
      averageReactionTime: 0,
      molesPerSecond: 0,
      scorePerSecond: 0,
      perfectHitRate: 0,
      consistency: 0,
      efficiency: 0,
      endurance: 0,
      precision: 0,
      focus: 0,
      overallRating: 0
    },
    achievements: []
  };
  
  // Save to database
  const sessionDoc = new WhackSession(session);
  await sessionDoc.save();
  
  return sessionDoc.toObject();
}

/**
 * Generate a mole at random position
 */
export function generateRandomMole(
  gridSize: number, 
  difficulty: WhackDifficulty,
  enableSpecialMoles: boolean = true
): WhackMole {
  const rows = Math.sqrt(gridSize);
  const cols = rows;
  
  // Random position
  const row = Math.floor(Math.random() * rows);
  const col = Math.floor(Math.random() * cols);
  const index = row * cols + col;
  
  const position: WhackMolePosition = { row, col, index };
  
  // Determine mole type
  const moleType = getRandomMoleType(enableSpecialMoles);
  
  // Calculate visibility time and points
  const baseVisibilityTime = GAME_CONFIG.moleVisibilityTime[difficulty];
  const visibilityTime = calculateMoleVisibilityTime(moleType, baseVisibilityTime);
  const points = calculateMolePoints(moleType, GAME_CONFIG.pointValues);
  
  // Get mole appearance
  const colors = getMoleColors();
  const color = colors[moleType] || colors.normal;
  
  const now = new Date();
  const despawnTime = new Date(now.getTime() + visibilityTime);
  
  return {
    id: generateMoleId(),
    position,
    type: moleType,
    spawnTime: now,
    despawnTime,
    isActive: true,
    isHit: false,
    points,
    speed: visibilityTime,
    size: getMoleSize(moleType),
    color,
    animation: getMoleAnimation(moleType),
    specialEffect: getMoleSpecialEffect(moleType)
  };
}

/**
 * Process a mole hit
 */
export async function processWhackMoleHit(params: {
  sessionId: string;
  moleId: string;
  hitPosition: { x: number; y: number };
  reactionTime: number;
  timestamp: Date;
}): Promise<{
  success: boolean;
  error?: string;
  points: number;
  streakCount: number;
  comboMultiplier: number;
  isPerfect: boolean;
  newScore: number;
  powerUpTriggered?: WhackPowerUp;
  achievement?: WhackAchievement;
}> {
  const { sessionId, moleId, hitPosition, reactionTime, timestamp } = params;
  
  const session = await WhackSession.findOne({ sessionId });
  
  if (!session) {
    return { success: false, error: "Session not found", points: 0, streakCount: 0, comboMultiplier: 1, isPerfect: false, newScore: 0 };
  }
  
  if (!session.isActive || session.isPaused) {
    return { success: false, error: "Game is not active", points: 0, streakCount: 0, comboMultiplier: 1, isPerfect: false, newScore: 0 };
  }
  
  // Find the mole (this would be tracked in a real-time system)
  // For now, we'll simulate a valid hit
  const moleType = getRandomMoleType(session.settings.enableSpecialMoles);
  const basePoints = GAME_CONFIG.pointValues[moleType];
  
  // Calculate accuracy (distance from center)
  const accuracy = validateHitAccuracy(hitPosition, { x: 0.5, y: 0.5 }); // Assume center target
  
  // Determine if perfect hit (within 200ms and high accuracy)
  const isPerfect = reactionTime <= 200 && accuracy >= 0.9;
  
  // Calculate points with multipliers
  let points = basePoints;
  if (isPerfect) {
    points *= 1.5; // Perfect hit bonus
  }
  points *= session.comboMultiplier;
  points = Math.round(points);
  
  // Update streak
  let newStreak = session.streakCurrent;
  let newComboMultiplier = session.comboMultiplier;
  
  if (isPerfect) {
    newStreak += 1;
    session.streakBest = Math.max(session.streakBest, newStreak);
    newComboMultiplier = Math.min(5, 1 + Math.floor(newStreak / 5) * 0.5);
  } else {
    newStreak = 0;
    newComboMultiplier = 1;
  }
  
  // Create hit record
  const hit: WhackMoleHit = {
    moleId,
    moleType,
    hitPosition: { row: 0, col: 0, index: 0 }, // Would be calculated from actual position
    reactionTime,
    accuracy,
    points,
    timestamp,
    streakCount: newStreak,
    comboMultiplier: newComboMultiplier,
    isPerfect,
    isSpecial: moleType !== 'normal'
  };
  
  // Update session
  session.streakCurrent = newStreak;
  session.comboMultiplier = newComboMultiplier;
  await session.addMoleHit(hit);
  
  // Check for power-up trigger
  let powerUpTriggered: WhackPowerUp | undefined;
  if (newStreak > 0 && newStreak % 10 === 0 && session.settings.enablePowerUps) {
    powerUpTriggered = triggerRandomPowerUp(session);
  }
  
  // Check for achievements
  let achievement: WhackAchievement | undefined;
  const newAchievements = await checkWhackAchievements(session.toObject());
  if (newAchievements.length > 0) {
    achievement = newAchievements[0]; // Return first new achievement
    session.achievements.push(...newAchievements);
    await session.save();
  }
  
  return {
    success: true,
    points,
    streakCount: newStreak,
    comboMultiplier: newComboMultiplier,
    isPerfect,
    newScore: session.currentScore,
    powerUpTriggered,
    achievement
  };
}

/**
 * Update game session
 */
export async function updateWhackGameSession(
  sessionId: string, 
  updateData: { action: string; data: any }
): Promise<WhackGameSession | null> {
  const session = await WhackSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }
  
  switch (updateData.action) {
    case 'miss':
      await session.addMoleMiss();
      break;
    case 'powerup':
      session.powerUpsUsed += 1;
      await session.save();
      break;
  }
  
  return session.toObject();
}

/**
 * Pause game session
 */
export async function pauseWhackSession(sessionId: string): Promise<WhackGameSession | null> {
  const session = await WhackSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }
  
  await session.pauseGame();
  return session.toObject();
}

/**
 * Resume game session
 */
export async function resumeWhackSession(sessionId: string): Promise<WhackGameSession | null> {
  const session = await WhackSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }
  
  await session.resumeGame();
  return session.toObject();
}

/**
 * Complete game session
 */
export async function completeWhackGameSession(params: {
  sessionId: string;
  endTime: Date;
  finalScore?: number;
}): Promise<WhackSessionResult | null> {
  const { sessionId, endTime, finalScore } = params;
  
  const session = await WhackSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }
  
  if (!session.isActive) {
    return null; // Already completed
  }
  
  // Update final score if provided
  if (finalScore !== undefined) {
    session.currentScore = finalScore;
  }
  
  // End the game
  await session.endGame();
  
  // Calculate performance metrics
  const performance = calculateWhackPerformanceMetrics(session.toObject());
  
  // Determine grade and rank
  const grade = calculateWhackGrade(session.statistics);
  const rank = calculateWhackRank(session.statistics);
  
  // Check for achievements
  const achievements = await checkWhackAchievements(session.toObject());
  session.achievements.push(...achievements);
  await session.save();
  
  // Check if personal best
  const userSessions = await WhackSession.find({ 
    userId: session.userId, 
    isActive: false,
    _id: { $ne: session._id }
  }).sort({ currentScore: -1 });
  
  const personalBest = userSessions.length === 0 || 
    session.currentScore > userSessions[0].currentScore;
  
  // Generate analysis
  const improvements = generateImprovements(session.toObject());
  const weakAreas = identifyWeakAreas(session.toObject());
  const strongAreas = identifyStrongAreas(session.toObject());
  const nextRecommendation = generateNextRecommendation(session.toObject());
  
  // Get comparison data
  const comparison = await getComparisonData(session.toObject());
  
  const result: WhackSessionResult = {
    sessionId,
    finalScore: session.currentScore,
    rank,
    grade,
    statistics: session.statistics,
    performance,
    achievements,
    personalBest,
    improvements,
    weakAreas,
    strongAreas,
    nextRecommendation,
    comparison
  };
  
  return result;
}

/**
 * Helper functions
 */

function calculateMoleVisibilityTime(moleType: WhackMoleType, baseTime: number): number {
  const multipliers: Record<WhackMoleType, number> = {
    normal: 1.0,
    fast: 0.6,
    slow: 1.5,
    bonus: 0.8,
    golden: 0.7,
    bomb: 2.0,
    freeze: 3.0,
    double: 1.0,
    giant: 1.2,
    mini: 0.5
  };
  
  return baseTime * (multipliers[moleType] || 1.0);
}

function getMoleSize(moleType: WhackMoleType): number {
  const sizes: Record<WhackMoleType, number> = {
    normal: 1.0,
    fast: 1.0,
    slow: 1.0,
    bonus: 1.1,
    golden: 1.2,
    bomb: 0.9,
    freeze: 1.0,
    double: 1.0,
    giant: 1.5,
    mini: 0.6
  };
  
  return sizes[moleType] || 1.0;
}

function getMoleAnimation(moleType: WhackMoleType): any {
  const animations = {
    normal: 'popup',
    fast: 'bounce',
    slow: 'slide',
    bonus: 'spin',
    golden: 'glow',
    bomb: 'shake',
    freeze: 'fade',
    double: 'zoom',
    giant: 'popup',
    mini: 'bounce'
  };
  
  return animations[moleType] || 'popup';
}

function getMoleSpecialEffect(moleType: WhackMoleType): any {
  const effects = {
    golden: 'sparkle',
    bomb: 'explosion',
    bonus: 'rainbow',
    freeze: 'ice',
    double: 'star'
  };
  
  return effects[moleType as keyof typeof effects];
}

function generateInitialPowerUps(): WhackPowerUp[] {
  return [
    {
      id: 'slow_motion',
      type: 'slow-motion',
      name: 'Slow Motion',
      description: 'Slows down moles for 5 seconds',
      effect: { slowMotion: 0.5 },
      duration: 5000,
      isActive: false,
      cooldown: 30000
    },
    {
      id: 'freeze_moles',
      type: 'freeze',
      name: 'Freeze',
      description: 'Freezes all moles for 3 seconds',
      effect: { freezeMoles: 3000 },
      duration: 3000,
      isActive: false,
      cooldown: 45000
    },
    {
      id: 'double_points',
      type: 'double-points',
      name: 'Double Points',
      description: 'Double points for 10 seconds',
      effect: { doublePoints: true },
      duration: 10000,
      isActive: false,
      cooldown: 60000
    }
  ];
}

function triggerRandomPowerUp(session: any): WhackPowerUp {
  const availablePowerUps = session.powerUps.filter((pu: WhackPowerUp) => 
    !pu.isActive && 
    (!pu.lastUsed || (Date.now() - pu.lastUsed.getTime() > pu.cooldown))
  );
  
  if (availablePowerUps.length > 0) {
    const powerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
    powerUp.isActive = true;
    powerUp.activatedAt = new Date();
    powerUp.lastUsed = new Date();
    return powerUp;
  }
  
  return session.powerUps[0]; // Fallback
}

export function calculateWhackPerformanceMetrics(session: WhackGameSession): WhackPerformanceMetrics {
  const stats = session.statistics;
  
  return {
    speed: Math.min(1, Math.max(0, 1 - (stats.averageReactionTime - 200) / 1000)), // Faster = better
    accuracy: stats.accuracy,
    consistency: stats.consistency,
    endurance: stats.endurance,
    focus: stats.focus,
    adaptability: stats.precision,
    overallRating: stats.overallRating
  };
}

export function calculateWhackGrade(stats: WhackGameStatistics): WhackGrade {
  const score = stats.overallRating * 100;
  
  if (score >= 95) return 'SSS';
  if (score >= 90) return 'SS';
  if (score >= 85) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function calculateWhackRank(stats: WhackGameStatistics): WhackRank {
  const rating = stats.overallRating;
  
  if (rating >= 0.95) return 'Grandmaster';
  if (rating >= 0.90) return 'Legend';
  if (rating >= 0.80) return 'Champion';
  if (rating >= 0.70) return 'Master';
  if (rating >= 0.60) return 'Expert';
  if (rating >= 0.50) return 'Skilled';
  if (rating >= 0.40) return 'Amateur';
  return 'Rookie';
}

export async function checkWhackAchievements(session: WhackGameSession): Promise<WhackAchievement[]> {
  const achievements: WhackAchievement[] = [];
  
  // Speed achievements
  if (session.statistics.averageReactionTime <= 150) {
    achievements.push({
      id: 'lightning_fast',
      name: 'Lightning Fast',
      description: 'Average reaction time under 150ms',
      condition: 'averageReactionTime <= 150',
      category: 'speed',
      rarity: 'epic',
      unlocked: true,
      unlockedAt: new Date(),
      icon: '⚡',
      points: 100
    });
  }
  
  // Accuracy achievements
  if (session.statistics.accuracy >= 0.9) {
    achievements.push({
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Achieve 90% accuracy',
      condition: 'accuracy >= 0.9',
      category: 'accuracy',
      rarity: 'rare',
      unlocked: true,
      unlockedAt: new Date(),
      icon: '🎯',
      points: 50
    });
  }
  
  // Streak achievements
  if (session.streakBest >= 20) {
    achievements.push({
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Achieve a 20-hit streak',
      condition: 'streakBest >= 20',
      category: 'streak',
      rarity: 'legendary',
      unlocked: true,
      unlockedAt: new Date(),
      icon: '🔥',
      points: 200
    });
  }
  
  return achievements;
}

function generateImprovements(session: WhackGameSession): string[] {
  const improvements: string[] = [];
  
  if (session.statistics.accuracy < 0.7) {
    improvements.push("Focus on accuracy over speed - take time to aim properly");
  }
  
  if (session.statistics.averageReactionTime > 500) {
    improvements.push("Practice quick reflexes with reaction time exercises");
  }
  
  if (session.statistics.consistency < 0.6) {
    improvements.push("Work on maintaining steady performance throughout the game");
  }
  
  return improvements;
}

function identifyWeakAreas(session: WhackGameSession): string[] {
  const weakAreas: string[] = [];
  
  if (session.statistics.accuracy < 0.7) weakAreas.push("Accuracy");
  if (session.statistics.averageReactionTime > 400) weakAreas.push("Reaction Time");
  if (session.statistics.consistency < 0.6) weakAreas.push("Consistency");
  if (session.statistics.endurance < 0.7) weakAreas.push("Endurance");
  
  return weakAreas;
}

function identifyStrongAreas(session: WhackGameSession): string[] {
  const strongAreas: string[] = [];
  
  if (session.statistics.accuracy >= 0.85) strongAreas.push("Accuracy");
  if (session.statistics.averageReactionTime <= 300) strongAreas.push("Speed");
  if (session.statistics.consistency >= 0.8) strongAreas.push("Consistency");
  if (session.statistics.focus >= 0.7) strongAreas.push("Focus");
  
  return strongAreas;
}

function generateNextRecommendation(session: WhackGameSession): string {
  if (session.statistics.accuracy < 0.6) {
    return "Practice with easier difficulty to improve accuracy";
  }
  
  if (session.statistics.averageReactionTime > 400) {
    return "Try speed training exercises to improve reaction time";
  }
  
  return "Continue practicing to improve overall performance";
}

async function getComparisonData(session: WhackGameSession): Promise<{
  averageScore: number;
  percentileRank: number;
  globalRank?: number;
}> {
  // This would query the database for comparison statistics
  // For now, return mock data
  return {
    averageScore: 500,
    percentileRank: 75,
    globalRank: 1250
  };
}