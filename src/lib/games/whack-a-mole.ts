// Whack-a-Mole Game Core Logic
import { prisma } from '@/lib/api/prisma';
import { 
  generateMoleId, 
  calculateMolePoints, 
  getRandomMoleType,
  getMoleColors,
  validateHitAccuracy 
} from "@/utility/games/whack-a-mole";
import type {
  WhackMolePosition,
  WhackMoleConfig,
  WhackMole,
  WhackGameGrid,
  WhackGameSession,
  WhackMoleHit,
  WhackPowerUp,
  WhackPowerUpEffect,
  WhackGameSettings,
  WhackGameStatistics,
  WhackSessionResult,
  WhackAchievement,
  WhackPerformanceMetrics,
  WhackGameConfiguration,
  WhackMoleType,
  WhackMoleAnimation,
  WhackSpecialEffect,
  WhackGameMode,
  WhackDifficulty,
  WhackPowerUpType,
  WhackGrade,
  WhackRank,
  WhackStartRequest,
  WhackHitRequest,
  WhackUpdateRequest
} from '@/types/games/whack-a-mole';

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
    easy: 1500,
    normal: 1200,
    hard: 1000,
    expert: 800,
    insane: 600
  },
  moleVisibilityTime: {
    easy: 2000,
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
  powerUpFrequency: 0.1,
  specialMoleFrequency: 0.2
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

function mapToSession(dbSession: any): WhackGameSession {
  const state = JSON.parse(dbSession.state || '{}');
  return {
    sessionId: dbSession.sessionId,
    userId: dbSession.userId || '',
    gameMode: state.gameMode || 'classic',
    difficulty: (dbSession.difficulty || 'normal') as WhackDifficulty,
    gridSize: state.gridSize ?? 9,
    duration: dbSession.duration || state.duration || 30,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    isActive: state.isActive ?? !dbSession.completed,
    isPaused: state.isPaused ?? false,
    pausedTime: state.pausedTime ?? 0,
    currentScore: dbSession.score,
    molesSpawned: state.molesSpawned ?? 0,
    molesHit: state.molesHit ?? 0,
    molesMissed: state.molesMissed ?? 0,
    perfectHits: state.perfectHits ?? 0,
    streakCurrent: state.streakCurrent ?? 0,
    streakBest: state.streakBest ?? 0,
    comboMultiplier: state.comboMultiplier ?? 1,
    totalReactionTime: state.totalReactionTime ?? 0,
    fastestReaction: state.fastestReaction ?? 0,
    slowestReaction: state.slowestReaction ?? 0,
    powerUpsUsed: state.powerUpsUsed ?? 0,
    specialMolesHit: state.specialMolesHit ?? 0,
    moleHistory: state.moleHistory || [],
    powerUps: state.powerUps || [],
    settings: state.settings || DEFAULT_SETTINGS,
    statistics: state.statistics || {
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
    achievements: state.achievements || []
  };
}

function addMoleHitToSession(sessionState: any, hit: WhackMoleHit) {
  const moleHistory = sessionState.moleHistory || [];
  moleHistory.push(hit);
  sessionState.moleHistory = moleHistory;

  sessionState.molesHit = (sessionState.molesHit || 0) + 1;
  sessionState.molesSpawned = (sessionState.molesSpawned || 0) + 1;
  sessionState.currentScore = (sessionState.currentScore || 0) + hit.points;

  if (hit.isPerfect) {
    sessionState.perfectHits = (sessionState.perfectHits || 0) + 1;
  }
  if (hit.isSpecial) {
    sessionState.specialMolesHit = (sessionState.specialMolesHit || 0) + 1;
  }

  sessionState.totalReactionTime = (sessionState.totalReactionTime || 0) + hit.reactionTime;
  if (!sessionState.fastestReaction || hit.reactionTime < sessionState.fastestReaction) {
    sessionState.fastestReaction = hit.reactionTime;
  }
  if (!sessionState.slowestReaction || hit.reactionTime > sessionState.slowestReaction) {
    sessionState.slowestReaction = hit.reactionTime;
  }

  updateWhackStatistics(sessionState);
}

function addMoleMissToSession(sessionState: any) {
  sessionState.molesMissed = (sessionState.molesMissed || 0) + 1;
  sessionState.molesSpawned = (sessionState.molesSpawned || 0) + 1;
  sessionState.streakCurrent = 0;
  sessionState.comboMultiplier = 1;
  updateWhackStatistics(sessionState);
}

function updateWhackStatistics(sessionState: any) {
  const molesHit = sessionState.molesHit || 0;
  const molesMissed = sessionState.molesMissed || 0;
  const molesSpawned = sessionState.molesSpawned || 1;
  const perfectHits = sessionState.perfectHits || 0;
  const totalReactionTime = sessionState.totalReactionTime || 0;

  const accuracy = molesSpawned > 0 ? molesHit / molesSpawned : 0;
  const averageReactionTime = molesHit > 0 ? totalReactionTime / molesHit : 0;
  const perfectHitRate = molesHit > 0 ? perfectHits / molesHit : 0;

  const duration = sessionState.duration || 30;
  const molesPerSecond = duration > 0 ? molesHit / duration : 0;
  const scorePerSecond = duration > 0 ? (sessionState.currentScore || 0) / duration : 0;

  let consistency = 1.0;
  const history: WhackMoleHit[] = sessionState.moleHistory || [];
  if (history.length > 1) {
    const times = history.map(h => h.reactionTime);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, 1 - (stdDev / (mean || 1)));
  }

  const focus = accuracy;
  const endurance = Math.min(1.0, duration / 180);
  const precision = accuracy * consistency;
  const efficiency = perfectHitRate;

  const overallRating = (accuracy * 0.3 + (1 - Math.min(1, averageReactionTime / 1000)) * 0.3 + consistency * 0.2 + precision * 0.2);

  sessionState.statistics = {
    accuracy,
    averageReactionTime,
    molesPerSecond,
    scorePerSecond,
    perfectHitRate,
    consistency,
    efficiency,
    endurance,
    precision,
    focus,
    overallRating: Math.round(overallRating * 100) / 100
  };
}

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
  
  const powerUps: WhackPowerUp[] = [];
  if (settings.enablePowerUps) {
    powerUps.push(...generateInitialPowerUps());
  }
  
  const state = {
    gameMode,
    difficulty,
    gridSize,
    duration,
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
  
  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId: `whack_${userId || 'guest'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      game: 'whack-a-mole',
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
 * Generate a mole at random position
 */
export function generateRandomMole(
  gridSize: number, 
  difficulty: WhackDifficulty,
  enableSpecialMoles: boolean = true
): WhackMole {
  const rows = Math.sqrt(gridSize);
  const cols = rows;
  
  const row = Math.floor(Math.random() * rows);
  const col = Math.floor(Math.random() * cols);
  const index = row * cols + col;
  
  const position: WhackMolePosition = { row, col, index };
  
  const moleType = getRandomMoleType(enableSpecialMoles);
  
  const baseVisibilityTime = GAME_CONFIG.moleVisibilityTime[difficulty];
  const visibilityTime = calculateMoleVisibilityTime(moleType, baseVisibilityTime);
  const points = calculateMolePoints(moleType, GAME_CONFIG.pointValues);
  
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
  
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return { success: false, error: "Session not found", points: 0, streakCount: 0, comboMultiplier: 1, isPerfect: false, newScore: 0 };
  }
  
  const state = JSON.parse(session.state || '{}');
  if (session.completed || state.isPaused) {
    return { success: false, error: "Game is not active", points: 0, streakCount: 0, comboMultiplier: 1, isPerfect: false, newScore: 0 };
  }
  
  const moleType = getRandomMoleType(state.settings?.enableSpecialMoles ?? true);
  const basePoints = GAME_CONFIG.pointValues[moleType];
  const accuracy = validateHitAccuracy(hitPosition, { x: 0.5, y: 0.5 });
  const isPerfect = reactionTime <= 200 && accuracy >= 0.9;
  
  let points = basePoints;
  if (isPerfect) {
    points *= 1.5;
  }
  points *= (state.comboMultiplier || 1);
  points = Math.round(points);
  
  let newStreak = state.streakCurrent || 0;
  let newComboMultiplier = state.comboMultiplier || 1;
  
  if (isPerfect) {
    newStreak += 1;
    state.streakBest = Math.max(state.streakBest || 0, newStreak);
    newComboMultiplier = Math.min(5, 1 + Math.floor(newStreak / 5) * 0.5);
  } else {
    newStreak = 0;
    newComboMultiplier = 1;
  }
  
  const hit: WhackMoleHit = {
    moleId,
    moleType,
    hitPosition: { row: 0, col: 0, index: 0 },
    reactionTime,
    accuracy,
    points,
    timestamp,
    streakCount: newStreak,
    comboMultiplier: newComboMultiplier,
    isPerfect,
    isSpecial: moleType !== 'normal'
  };
  
  state.streakCurrent = newStreak;
  state.comboMultiplier = newComboMultiplier;
  addMoleHitToSession(state, hit);
  
  let powerUpTriggered: WhackPowerUp | undefined;
  if (newStreak > 0 && newStreak % 10 === 0 && state.settings?.enablePowerUps) {
    powerUpTriggered = triggerRandomPowerUp(state);
  }
  
  let achievement: WhackAchievement | undefined;
  const newAchievements = await checkWhackAchievements(mapToSession({ ...session, state: JSON.stringify(state) }));
  if (newAchievements.length > 0) {
    achievement = newAchievements[0];
    state.achievements = state.achievements || [];
    state.achievements.push(...newAchievements);
  }
  
  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state),
      score: state.currentScore || 0
    }
  });
  
  return {
    success: true,
    points,
    streakCount: newStreak,
    comboMultiplier: newComboMultiplier,
    isPerfect,
    newScore: updatedSession.score,
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
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }

  const state = JSON.parse(session.state || '{}');
  
  switch (updateData.action) {
    case 'miss':
      addMoleMissToSession(state);
      break;
    case 'powerup':
      state.powerUpsUsed = (state.powerUpsUsed || 0) + 1;
      break;
  }

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });
  
  return mapToSession(updatedSession);
}

/**
 * Pause game session
 */
export async function pauseWhackSession(sessionId: string): Promise<WhackGameSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }
  
  const state = JSON.parse(session.state || '{}');
  state.isPaused = true;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });
  return mapToSession(updatedSession);
}

/**
 * Resume game session
 */
export async function resumeWhackSession(sessionId: string): Promise<WhackGameSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }
  
  const state = JSON.parse(session.state || '{}');
  state.isPaused = false;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });
  return mapToSession(updatedSession);
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
  
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }
  
  if (session.completed) {
    return null;
  }

  const state = JSON.parse(session.state || '{}');
  state.isActive = false;

  if (finalScore !== undefined) {
    state.currentScore = finalScore;
  }

  updateWhackStatistics(state);

  const tempSession = mapToSession({ ...session, state: JSON.stringify(state) });
  const performance = calculateWhackPerformanceMetrics(tempSession);
  const grade = calculateWhackGrade(state.statistics);
  const rank = calculateWhackRank(state.statistics);
  const achievements = await checkWhackAchievements(tempSession);
  state.achievements = state.achievements || [];
  state.achievements.push(...achievements);

  const score = state.currentScore || 0;

  let personalBest = false;
  if (session.userId) {
    const userSessions = await prisma.gameSession.findMany({
      where: { 
        userId: session.userId, 
        game: 'whack-a-mole',
        completed: true
      },
      orderBy: { score: 'desc' },
      take: 1
    });
    personalBest = userSessions.length === 0 || score > userSessions[0].score;
  }

  const finalSession = mapToSession({ ...session, state: JSON.stringify(state) });
  const improvements = generateImprovements(finalSession);
  const weakAreas = identifyWeakAreas(finalSession);
  const strongAreas = identifyStrongAreas(finalSession);
  const nextRecommendation = generateNextRecommendation(finalSession);
  const comparison = await getComparisonData(finalSession);

  const duration = Math.floor((endTime.getTime() - session.startedAt.getTime()) / 1000);

  await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt: endTime,
      duration,
      score,
      state: JSON.stringify(state)
    }
  });

  const result: WhackSessionResult = {
    sessionId,
    finalScore: score,
    rank,
    grade,
    statistics: state.statistics,
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

function triggerRandomPowerUp(state: any): WhackPowerUp {
  const availablePowerUps = state.powerUps.filter((pu: WhackPowerUp) => 
    !pu.isActive && 
    (!pu.lastUsed || (Date.now() - new Date(pu.lastUsed).getTime() > pu.cooldown))
  );
  
  if (availablePowerUps.length > 0) {
    const powerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
    powerUp.isActive = true;
    powerUp.activatedAt = new Date();
    powerUp.lastUsed = new Date();
    return powerUp;
  }
  
  return state.powerUps[0];
}

export function calculateWhackPerformanceMetrics(session: WhackGameSession): WhackPerformanceMetrics {
  const stats = session.statistics;
  
  return {
    speed: Math.min(1, Math.max(0, 1 - (stats.averageReactionTime - 200) / 1000)),
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
  return {
    averageScore: 500,
    percentileRank: 75,
    globalRank: 1250
  };
}