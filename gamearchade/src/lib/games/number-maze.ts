/**
 * Game logic and database operations for Number Maze Game
 */

import { v4 as uuidv4 } from 'uuid';
import NumberMazeSessionModel from '@/models/games/number-maze';
import type {
  NumberMazeSession,
  NumberMazeDifficultyLevel,
  MazeOperation,
  NumberMazeStats,
  OperationStats
} from '@/types/games/number-maze';

/**
 * Create a new number maze session
 */
export async function createMazeSession(
  startNumber: number,
  targetNumber: number,
  difficulty: NumberMazeDifficultyLevel,
  userId?: string
): Promise<NumberMazeSession> {
  const session = await NumberMazeSessionModel.create({
    userId,
    sessionId: uuidv4(),
    startNumber,
    targetNumber,
    currentNumber: startNumber,
    moves: [],
    moveCount: 0,
    startTime: new Date(),
    completed: false,
    success: false,
    difficulty,
    score: 0,
    timeElapsed: 0
  });

  return session.toObject();
}

/**
 * Get a maze session by session ID
 */
export async function getMazeSession(sessionId: string): Promise<NumberMazeSession | null> {
  const session = await NumberMazeSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Make a move in the maze
 */
export async function makeMove(
  sessionId: string,
  operation: MazeOperation,
  operand?: number
): Promise<{ success: boolean; session: NumberMazeSession | null }> {
  const session = await NumberMazeSessionModel.findOne({ sessionId });

  if (!session || session.completed) {
    return { success: false, session: session ? session.toObject() : null };
  }

  const result = session.makeMove(operation, operand);
  
  if (result.success) {
    // Calculate score if completed
    if (session.completed && session.success) {
      session.score = session.calculateScore();
    }
    
    await session.save();
  }

  return { success: result.success, session: session.toObject() };
}

/**
 * Complete a maze session
 */
export async function completeMazeSession(sessionId: string): Promise<NumberMazeSession | null> {
  const session = await NumberMazeSessionModel.findOne({ sessionId });

  if (!session) return null;

  if (!session.completed) {
    session.completed = true;
    session.endTime = new Date();
    session.timeElapsed = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );
    
    // Only calculate score if target was reached
    if (session.currentNumber === session.targetNumber) {
      session.success = true;
      session.score = session.calculateScore();
    }
    
    await session.save();
  }

  return session.toObject();
}

/**
 * Get user's maze statistics
 */
export async function getUserMazeStats(userId: string): Promise<NumberMazeStats> {
  const sessions = await NumberMazeSessionModel.find({ userId }).lean();

  if (sessions.length === 0) {
    return {
      totalMazesAttempted: 0,
      totalMazesCompleted: 0,
      completionRate: 0,
      averageMoves: 0,
      bestMoves: 0,
      averageTime: 0,
      bestTime: 0,
      averageScore: 0,
      bestScore: 0,
      perfectSolves: 0,
      fastestDifficulty: 'beginner',
      difficultiesMastered: [],
      favoriteOperations: [],
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const completedSessions = sessions.filter(s => s.completed);
  const successfulSessions = sessions.filter(s => s.success);

  const totalMazesAttempted = sessions.length;
  const totalMazesCompleted = completedSessions.length;
  const completionRate = (totalMazesCompleted / totalMazesAttempted) * 100;

  // Move statistics
  const allMoves = successfulSessions.map(s => s.moveCount);
  const averageMoves = allMoves.length > 0
    ? allMoves.reduce((sum, m) => sum + m, 0) / allMoves.length
    : 0;
  const bestMoves = allMoves.length > 0 ? Math.min(...allMoves) : 0;

  // Time statistics
  const allTimes = successfulSessions.map(s => s.timeElapsed);
  const averageTime = allTimes.length > 0
    ? allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length
    : 0;
  const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;

  // Score statistics
  const allScores = successfulSessions.map(s => s.score);
  const averageScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0;
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

  // Perfect solves (8 moves or less)
  const perfectSolves = successfulSessions.filter(s => s.moveCount <= 8).length;

  // Favorite operations
  const operationCount: Record<MazeOperation, number> = {
    add: 0,
    subtract: 0,
    multiply: 0,
    divide: 0,
    square: 0,
    sqrt: 0
  };
  sessions.forEach(session => {
    session.moves.forEach(move => {
      operationCount[move.operation as MazeOperation]++;
    });
  });
  const favoriteOperations = (Object.keys(operationCount) as MazeOperation[])
    .sort((a, b) => operationCount[b] - operationCount[a])
    .slice(0, 3);

  // Fastest difficulty (highest completion rate)
  const difficultyStats: Record<NumberMazeDifficultyLevel, { total: number; completed: number }> = {
    beginner: { total: 0, completed: 0 },
    intermediate: { total: 0, completed: 0 },
    advanced: { total: 0, completed: 0 },
    expert: { total: 0, completed: 0 },
    master: { total: 0, completed: 0 }
  };
  sessions.forEach(s => {
    difficultyStats[s.difficulty].total++;
    if (s.success) difficultyStats[s.difficulty].completed++;
  });
  const fastestDifficulty = (Object.keys(difficultyStats) as NumberMazeDifficultyLevel[])
    .reduce((a, b) => {
      const rateA = difficultyStats[a].total > 0 
        ? difficultyStats[a].completed / difficultyStats[a].total 
        : 0;
      const rateB = difficultyStats[b].total > 0 
        ? difficultyStats[b].completed / difficultyStats[b].total 
        : 0;
      return rateA > rateB ? a : b;
    });

  // Mastered difficulties (70%+ success rate)
  const difficultiesMastered = (Object.keys(difficultyStats) as NumberMazeDifficultyLevel[])
    .filter(diff => {
      const stats = difficultyStats[diff];
      return stats.total > 0 && (stats.completed / stats.total) >= 0.7;
    });

  return {
    totalMazesAttempted,
    totalMazesCompleted,
    completionRate,
    averageMoves,
    bestMoves,
    averageTime,
    bestTime,
    averageScore,
    bestScore,
    perfectSolves,
    fastestDifficulty,
    difficultiesMastered,
    favoriteOperations,
    currentStreak: 0, // TODO: Implement streak calculation
    bestStreak: 0
  };
}

/**
 * Get operation statistics
 */
export async function getOperationStats(userId: string): Promise<OperationStats[]> {
  const sessions = await NumberMazeSessionModel.find({ userId }).lean();

  const stats: Record<MazeOperation, { used: number; successfulSessions: number; totalImpact: number }> = {
    add: { used: 0, successfulSessions: 0, totalImpact: 0 },
    subtract: { used: 0, successfulSessions: 0, totalImpact: 0 },
    multiply: { used: 0, successfulSessions: 0, totalImpact: 0 },
    divide: { used: 0, successfulSessions: 0, totalImpact: 0 },
    square: { used: 0, successfulSessions: 0, totalImpact: 0 },
    sqrt: { used: 0, successfulSessions: 0, totalImpact: 0 }
  };

  sessions.forEach(session => {
    const operationsUsed = new Set<MazeOperation>();
    
    session.moves.forEach(move => {
      const op = move.operation as MazeOperation;
      stats[op].used++;
      operationsUsed.add(op);
      stats[op].totalImpact += Math.abs(move.resultValue);
    });

    if (session.success) {
      operationsUsed.forEach(op => {
        stats[op].successfulSessions++;
      });
    }
  });

  return (Object.keys(stats) as MazeOperation[]).map(operation => ({
    operation,
    timesUsed: stats[operation].used,
    successRate: stats[operation].used > 0 
      ? (stats[operation].successfulSessions / stats[operation].used) * 100 
      : 0,
    averageImpact: stats[operation].used > 0
      ? stats[operation].totalImpact / stats[operation].used
      : 0
  }));
}

/**
 * Get recent maze sessions
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 10
): Promise<NumberMazeSession[]> {
  const sessions = await NumberMazeSessionModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return sessions;
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await NumberMazeSessionModel.deleteMany({
    completed: false,
    createdAt: { $lt: cutoffDate }
  });

  return result.deletedCount;
}
