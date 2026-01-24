/**
 * Database operations for Reaction Time Game
 */

import ReactionSessionModel from '@/models/games/reaction-time';
import type {
  ReactionSession,
  ReactionAttempt,
  ReactionStats,
  ReactionSessionSummary,
  ReactionDifficulty,
  ReactionPerformance
} from '@/types/games/reaction-time';

/**
 * Create a new reaction time session
 */
export async function createReactionSession(
  sessionData: Omit<ReactionSession, 'attempts' | 'currentAttempt' | 'completed' | 'falseStarts'>
): Promise<ReactionSession> {
  const session = new ReactionSessionModel({
    ...sessionData,
    attempts: [],
    currentAttempt: 0,
    completed: false,
    falseStarts: 0
  });

  await session.save();

  return session.toObject();
}

/**
 * Get reaction session by ID
 */
export async function getReactionSession(sessionId: string): Promise<ReactionSession | null> {
  const session = await ReactionSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Record a reaction time attempt
 */
export async function recordAttempt(
  sessionId: string,
  attempt: Omit<ReactionAttempt, 'attemptNumber' | 'timestamp'>
): Promise<ReactionSession | null> {
  const session = await ReactionSessionModel.findOne({ sessionId });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Session already completed');
  }

  // Check if session has reached max attempts
  if (session.currentAttempt >= session.totalAttempts) {
    throw new Error('Maximum attempts reached');
  }

  // Add attempt
  session.attempts.push({
    attemptNumber: session.currentAttempt + 1,
    reactionTime: attempt.reactionTime,
    timestamp: new Date(),
    valid: attempt.valid,
    tooEarly: attempt.tooEarly
  });

  session.currentAttempt += 1;

  // Recalculate stats
  session.calculateStats();

  await session.save();

  return session.toObject();
}

/**
 * Complete reaction session
 */
export async function completeReactionSession(
  sessionId: string
): Promise<ReactionSession | null> {
  const session = await ReactionSessionModel.findOne({ sessionId });
  
  if (!session) return null;
  if (session.completed) return session.toObject();

  session.completed = true;
  session.endTime = new Date();

  // Calculate final stats and score
  session.calculateStats();
  session.calculateScore();

  await session.save();

  return session.toObject();
}

/**
 * Get user's reaction time statistics
 */
export async function getUserReactionStats(userId: string): Promise<ReactionStats> {
  const sessions = await ReactionSessionModel
    .find({ userId, completed: true })
    .sort({ startTime: -1 })
    .lean();

  if (sessions.length === 0) {
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

  const totalSessions = sessions.length;
  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts.length, 0);

  // Find overall best time
  const overallBestTime = Math.min(...sessions.map(s => s.bestTime || Infinity));
  
  // Calculate overall average time
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

  // Best and average scores
  const bestScore = Math.max(...sessions.map(s => s.score || 0));
  const averageScore = Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions);

  // Performance distribution
  const performanceDistribution: Record<ReactionPerformance, number> = {
    elite: 0,
    excellent: 0,
    good: 0,
    average: 0,
    belowAverage: 0,
    slow: 0
  };
  sessions.forEach(s => {
    if (s.performance) {
      performanceDistribution[s.performance as ReactionPerformance]++;
    }
  });

  // Calculate improvement rate (compare first 5 sessions to last 5 sessions)
  let improvementRate = 0;
  if (sessions.length >= 10) {
    const firstFive = sessions.slice(-5).map(s => s.averageTime || 0);
    const lastFive = sessions.slice(0, 5).map(s => s.averageTime || 0);
    
    const firstAvg = firstFive.reduce((sum, t) => sum + t, 0) / 5;
    const lastAvg = lastFive.reduce((sum, t) => sum + t, 0) / 5;
    
    improvementRate = Math.round(((firstAvg - lastAvg) / firstAvg) * 100);
  }

  // Recent sessions
  const recentSessions: ReactionSessionSummary[] = sessions.slice(0, 10).map(s => ({
    sessionId: s.sessionId,
    score: s.score || 0,
    averageTime: s.averageTime || 0,
    bestTime: s.bestTime || 0,
    performance: s.performance as ReactionPerformance || 'average',
    difficulty: s.difficulty as ReactionDifficulty,
    completedAt: s.endTime || s.startTime
  }));

  // Average consistency
  const consistencies = sessions.map(s => s.consistency || 0).filter(c => c > 0);
  const averageConsistency = consistencies.length > 0
    ? Math.round(consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length)
    : 0;

  // Total false starts
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
  const sessions = await ReactionSessionModel
    .find({ userId, completed: true })
    .sort({ endTime: -1 })
    .limit(limit)
    .lean();

  return sessions.map(s => ({
    sessionId: s.sessionId,
    score: s.score || 0,
    averageTime: s.averageTime || 0,
    bestTime: s.bestTime || 0,
    performance: s.performance as ReactionPerformance || 'average',
    difficulty: s.difficulty as ReactionDifficulty,
    completedAt: s.endTime || s.startTime
  }));
}

/**
 * Get global best times for comparison
 */
export async function getGlobalBestTimes(limit: number = 100): Promise<number[]> {
  const sessions = await ReactionSessionModel
    .find({ completed: true, bestTime: { $exists: true } })
    .sort({ bestTime: 1 })
    .limit(limit)
    .select('bestTime')
    .lean();

  return sessions.map(s => s.bestTime!);
}

/**
 * Delete expired sessions (older than 24 hours and not completed)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await ReactionSessionModel.deleteMany({
    completed: false,
    startTime: { $lt: expiryTime }
  });

  return result.deletedCount || 0;
}
