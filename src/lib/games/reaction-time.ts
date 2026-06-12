/**
 * Database operations for Reaction Time Game
 */

import { prisma } from '@/lib/api/prisma';
import type {
  ReactionSession,
  ReactionAttempt,
  ReactionStats,
  ReactionSessionSummary,
  ReactionDifficulty,
  ReactionPerformance
} from '@/types/games/reaction-time';

function mapToSession(dbSession: any): ReactionSession {
  const state = JSON.parse(dbSession.state || '{}');
  return {
    sessionId: dbSession.sessionId,
    userId: dbSession.userId || undefined,
    attempts: state.attempts || [],
    currentAttempt: state.currentAttempt ?? 0,
    totalAttempts: state.totalAttempts ?? 5,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    averageTime: state.averageTime,
    bestTime: state.bestTime,
    worstTime: state.worstTime,
    consistency: state.consistency,
    score: dbSession.score,
    performance: state.performance as ReactionPerformance,
    difficulty: (dbSession.difficulty || 'medium') as ReactionDifficulty,
    completed: dbSession.completed,
    falseStarts: state.falseStarts ?? 0
  };
}

function getPerformanceCategory(averageTime: number): ReactionPerformance {
  if (averageTime <= 180) return 'elite';
  if (averageTime <= 220) return 'excellent';
  if (averageTime <= 260) return 'good';
  if (averageTime <= 320) return 'average';
  if (averageTime <= 450) return 'belowAverage';
  return 'slow';
}

function calculateReactionStatsAndScore(state: any, difficulty: ReactionDifficulty): {
  averageTime?: number;
  bestTime?: number;
  worstTime?: number;
  consistency?: number;
  score?: number;
  performance?: ReactionPerformance;
  falseStarts: number;
} {
  const attempts: ReactionAttempt[] = state.attempts || [];
  const falseStarts = attempts.filter(a => a.tooEarly).length;
  const validAttempts = attempts.filter(a => a.valid && !a.tooEarly);

  if (validAttempts.length === 0) {
    return {
      averageTime: undefined,
      bestTime: undefined,
      worstTime: undefined,
      consistency: undefined,
      score: 0,
      performance: undefined,
      falseStarts
    };
  }

  const times = validAttempts.map(a => a.reactionTime);
  const bestTime = Math.min(...times);
  const worstTime = Math.max(...times);
  const averageTime = Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);

  // Consistency (standard deviation)
  const mean = averageTime;
  const squareDiffs = times.map(t => Math.pow(t - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, d) => sum + d, 0) / times.length;
  const consistency = Math.round(Math.sqrt(avgSquareDiff));

  // Base score calculation (lower average time = higher score)
  let baseScore = Math.max(0, 1000 - (averageTime - 100) * 1.5);
  
  // Consistency bonus (lower deviation = higher bonus, up to 150 points)
  const consistencyBonus = Math.max(0, 150 - consistency * 2);

  // Best time bonus
  let bestTimeBonus = 0;
  if (bestTime < 180) bestTimeBonus = 100;
  else if (bestTime < 220) bestTimeBonus = 50;

  // Penalties
  const penaltyDeduction = falseStarts * 50;

  // Multiplier
  let multiplier = 1.0;
  if (difficulty === 'easy') multiplier = 0.8;
  else if (difficulty === 'hard') multiplier = 1.3;
  else if (difficulty === 'extreme') multiplier = 1.6;

  const score = Math.round(Math.max(0, (baseScore + consistencyBonus + bestTimeBonus - penaltyDeduction) * multiplier));
  const performance = getPerformanceCategory(averageTime);

  return {
    averageTime,
    bestTime,
    worstTime,
    consistency,
    score,
    performance,
    falseStarts
  };
}

/**
 * Create a new reaction time session
 */
export async function createReactionSession(
  sessionData: Omit<ReactionSession, 'attempts' | 'currentAttempt' | 'completed' | 'falseStarts'>
): Promise<ReactionSession> {
  const session = await prisma.gameSession.create({
    data: {
      userId: sessionData.userId || null,
      sessionId: sessionData.sessionId,
      game: 'reaction-time',
      difficulty: sessionData.difficulty || 'medium',
      state: JSON.stringify({
        attempts: [],
        currentAttempt: 0,
        totalAttempts: sessionData.totalAttempts || 5,
        falseStarts: 0
      }),
      startedAt: sessionData.startTime || new Date(),
      completed: false,
      score: 0
    }
  });

  return mapToSession(session);
}

/**
 * Get reaction session by ID
 */
export async function getReactionSession(sessionId: string): Promise<ReactionSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
}

/**
 * Record a reaction time attempt
 */
export async function recordAttempt(
  sessionId: string,
  attempt: Omit<ReactionAttempt, 'attemptNumber' | 'timestamp'>
): Promise<ReactionSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Session already completed');
  }

  const state = JSON.parse(session.state || '{}');
  const attempts: ReactionAttempt[] = state.attempts || [];
  const currentAttempt = state.currentAttempt || 0;
  const totalAttempts = state.totalAttempts || 5;

  if (currentAttempt >= totalAttempts) {
    throw new Error('Maximum attempts reached');
  }

  const nextAttemptNumber = currentAttempt + 1;
  attempts.push({
    attemptNumber: nextAttemptNumber,
    reactionTime: attempt.reactionTime,
    timestamp: new Date(),
    valid: attempt.valid,
    tooEarly: attempt.tooEarly
  });

  state.attempts = attempts;
  state.currentAttempt = nextAttemptNumber;

  const stats = calculateReactionStatsAndScore(state, (session.difficulty || 'medium') as ReactionDifficulty);
  Object.assign(state, stats);

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state),
      score: stats.score || 0
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Complete reaction session
 */
export async function completeReactionSession(
  sessionId: string
): Promise<ReactionSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) return null;
  if (session.completed) return mapToSession(session);

  const state = JSON.parse(session.state || '{}');
  const completedAt = new Date();
  const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

  const stats = calculateReactionStatsAndScore(state, (session.difficulty || 'medium') as ReactionDifficulty);
  Object.assign(state, stats);

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt,
      duration,
      score: stats.score || 0,
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Get user's reaction time statistics
 */
export async function getUserReactionStats(userId: string): Promise<ReactionStats> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'reaction-time', completed: true },
    orderBy: { startedAt: 'desc' }
  });

  if (dbSessions.length === 0) {
    return {
      userId,
      totalSessions: 0,
      totalAttempts: 0,
      overallBestTime: 0,
      overallAverageTime: 0,
      bestScore: 0,
      averageScore: 0,
      performanceDistribution: {
        elite: 0,
        excellent: 0,
        good: 0,
        average: 0,
        belowAverage: 0,
        slow: 0
      },
      improvementRate: 0,
      recentSessions: [],
      averageConsistency: 0,
      totalFalseStarts: 0
    };
  }

  const sessions = dbSessions.map(mapToSession);
  const totalSessions = sessions.length;
  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts.length, 0);

  const validBestTimes = sessions.map(s => s.bestTime || Infinity).filter(t => t !== Infinity);
  const overallBestTime = validBestTimes.length > 0 ? Math.min(...validBestTimes) : 0;
  
  const allValidTimes: number[] = [];
  sessions.forEach(s => {
    s.attempts.forEach(a => {
      if (a.valid && !a.tooEarly) {
        allValidTimes.push(a.reactionTime);
      }
    });
  });
  const overallAverageTime = allValidTimes.length > 0
    ? Math.round(allValidTimes.reduce((sum, t) => sum + t, 0) / allValidTimes.length)
    : 0;

  const bestScore = Math.max(...sessions.map(s => s.score || 0));
  const averageScore = Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions);

  const performanceDistribution: Record<ReactionPerformance, number> = {
    elite: 0,
    excellent: 0,
    good: 0,
    average: 0,
    belowAverage: 0,
    slow: 0
  };
  sessions.forEach(s => {
    if (s.performance && performanceDistribution[s.performance] !== undefined) {
      performanceDistribution[s.performance]++;
    }
  });

  let improvementRate = 0;
  if (sessions.length >= 10) {
    const firstFive = sessions.slice(-5).map(s => s.averageTime || 0).filter(t => t > 0);
    const lastFive = sessions.slice(0, 5).map(s => s.averageTime || 0).filter(t => t > 0);
    
    if (firstFive.length > 0 && lastFive.length > 0) {
      const firstAvg = firstFive.reduce((sum, t) => sum + t, 0) / firstFive.length;
      const lastAvg = lastFive.reduce((sum, t) => sum + t, 0) / lastFive.length;
      improvementRate = Math.round(((firstAvg - lastAvg) / firstAvg) * 100);
    }
  }

  const recentSessions: ReactionSessionSummary[] = sessions.slice(0, 10).map(s => ({
    sessionId: s.sessionId,
    score: s.score || 0,
    averageTime: s.averageTime || 0,
    bestTime: s.bestTime || 0,
    performance: s.performance || 'average',
    difficulty: s.difficulty,
    completedAt: s.endTime || s.startTime
  }));

  const consistencies = sessions.map(s => s.consistency || 0).filter(c => c > 0);
  const averageConsistency = consistencies.length > 0
    ? Math.round(consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length)
    : 0;

  const totalFalseStarts = sessions.reduce((sum, s) => sum + (s.falseStarts || 0), 0);

  return {
    userId,
    totalSessions,
    totalAttempts,
    overallBestTime,
    overallAverageTime,
    bestScore,
    averageScore,
    performanceDistribution,
    improvementRate,
    recentSessions,
    averageConsistency,
    totalFalseStarts
  };
}

/**
 * Get recent reaction sessions
 */
export async function getRecentReactionSessions(
  userId: string,
  limit: number = 10
): Promise<ReactionSessionSummary[]> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'reaction-time', completed: true },
    orderBy: { completedAt: 'desc' },
    take: limit
  });

  return dbSessions.map(s => {
    const state = JSON.parse(s.state || '{}');
    return {
      sessionId: s.sessionId,
      score: s.score || 0,
      averageTime: state.averageTime || 0,
      bestTime: state.bestTime || 0,
      performance: (state.performance || 'average') as ReactionPerformance,
      difficulty: (s.difficulty || 'medium') as ReactionDifficulty,
      completedAt: s.completedAt || s.startedAt
    };
  });
}

/**
 * Get global best times for comparison
 */
export async function getGlobalBestTimes(limit: number = 100): Promise<number[]> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { game: 'reaction-time', completed: true },
    take: limit
  });

  const bestTimes = dbSessions
    .map(s => {
      try {
        const state = JSON.parse(s.state || '{}');
        return state.bestTime || Infinity;
      } catch (e) {
        return Infinity;
      }
    })
    .filter(t => t !== Infinity)
    .sort((a, b) => a - b);

  return bestTimes;
}

/**
 * Delete expired sessions (older than 24 hours and not completed)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await prisma.gameSession.deleteMany({
    where: {
      game: 'reaction-time',
      completed: false,
      startedAt: { lt: expiryTime }
    }
  });

  return result.count;
}
