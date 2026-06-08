/**
 * Game logic and database operations for Number Maze Game
 */

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/api/prisma';
import type {
  NumberMazeSession,
  NumberMazeDifficultyLevel,
  MazeOperation,
  NumberMazeStats,
  OperationStats,
  MazeMove
} from '@/types/games/number-maze';

function mapToSession(dbSession: any): NumberMazeSession {
  const state = JSON.parse(dbSession.state || '{}');
  return {
    _id: dbSession.id,
    userId: dbSession.userId || undefined,
    sessionId: dbSession.sessionId,
    startNumber: state.startNumber ?? 0,
    targetNumber: state.targetNumber ?? 0,
    currentNumber: state.currentNumber ?? 0,
    moves: state.moves || [],
    moveCount: state.moves ? state.moves.length : 0,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    completed: dbSession.completed,
    success: state.success ?? false,
    difficulty: (dbSession.difficulty || 'beginner') as NumberMazeDifficultyLevel,
    score: dbSession.score,
    timeElapsed: dbSession.duration || state.timeElapsed || 0,
    createdAt: dbSession.createdAt,
    updatedAt: dbSession.updatedAt
  };
}

function processMove(
  currentNumber: number,
  operation: MazeOperation,
  operand?: number
): { success: boolean; resultValue: number } {
  let resultValue = currentNumber;
  let success = true;

  switch (operation) {
    case 'add':
      if (operand === undefined) return { success: false, resultValue };
      resultValue = currentNumber + operand;
      break;
    case 'subtract':
      if (operand === undefined) return { success: false, resultValue };
      resultValue = currentNumber - operand;
      break;
    case 'multiply':
      if (operand === undefined) return { success: false, resultValue };
      resultValue = currentNumber * operand;
      break;
    case 'divide':
      if (operand === undefined || operand === 0) return { success: false, resultValue };
      if (currentNumber % operand !== 0) {
        success = false;
      } else {
        resultValue = currentNumber / operand;
      }
      break;
    case 'square':
      resultValue = currentNumber * currentNumber;
      break;
    case 'sqrt':
      if (currentNumber < 0) {
        success = false;
      } else {
        const root = Math.sqrt(currentNumber);
        if (Number.isInteger(root)) {
          resultValue = root;
        } else {
          success = false;
        }
      }
      break;
    default:
      success = false;
  }

  return { success, resultValue };
}

function calculateScore(
  moveCount: number,
  timeElapsed: number,
  difficulty: NumberMazeDifficultyLevel
): number {
  let score = 1000;
  score -= moveCount * 15;
  score -= timeElapsed * 2;

  let multiplier = 1;
  if (difficulty === 'intermediate') multiplier = 1.2;
  else if (difficulty === 'advanced') multiplier = 1.5;
  else if (difficulty === 'expert') multiplier = 2.0;
  else if (difficulty === 'master') multiplier = 2.5;

  score *= multiplier;
  return Math.round(Math.max(100, score));
}

/**
 * Create a new number maze session
 */
export async function createMazeSession(
  startNumber: number,
  targetNumber: number,
  difficulty: NumberMazeDifficultyLevel,
  userId?: string
): Promise<NumberMazeSession> {
  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId: uuidv4(),
      game: 'number-maze',
      difficulty,
      state: JSON.stringify({
        startNumber,
        targetNumber,
        currentNumber: startNumber,
        moves: [],
        success: false
      }),
      startedAt: new Date(),
      completed: false,
      score: 0
    }
  });

  return mapToSession(session);
}

/**
 * Get a maze session by session ID
 */
export async function getMazeSession(sessionId: string): Promise<NumberMazeSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
}

/**
 * Make a move in the maze
 */
export async function makeMove(
  sessionId: string,
  operation: MazeOperation,
  operand?: number
): Promise<{ success: boolean; session: NumberMazeSession | null }> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });

  if (!session || session.completed) {
    return { success: false, session: session ? mapToSession(session) : null };
  }

  const state = JSON.parse(session.state || '{}');
  const currentNumber = state.currentNumber;
  const targetNumber = state.targetNumber;

  const moveRes = processMove(currentNumber, operation, operand);
  if (!moveRes.success) {
    return { success: false, session: mapToSession(session) };
  }

  const moves: MazeMove[] = state.moves || [];
  const nextMoveNumber = moves.length + 1;
  moves.push({
    operation,
    operand,
    resultValue: moveRes.resultValue,
    timestamp: new Date(),
    moveNumber: nextMoveNumber
  });

  state.currentNumber = moveRes.resultValue;
  state.moves = moves;

  const reachedTarget = moveRes.resultValue === targetNumber;
  let completed = session.completed as boolean;
  let completedAt = session.completedAt;
  let success = state.success || false;
  let score = session.score;

  if (reachedTarget) {
    completed = true;
    success = true;
    completedAt = new Date();
    const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);
    score = calculateScore(moves.length, duration, (session.difficulty || 'beginner') as NumberMazeDifficultyLevel);
  }

  state.success = success;

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

  return { success: true, session: mapToSession(updatedSession) };
}

/**
 * Complete a maze session
 */
export async function completeMazeSession(sessionId: string): Promise<NumberMazeSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });

  if (!session) return null;

  if (!session.completed) {
    const state = JSON.parse(session.state || '{}');
    const completedAt = new Date();
    const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);
    const reachedTarget = state.currentNumber === state.targetNumber;
    
    let score = session.score;
    let success = state.success || false;

    if (reachedTarget) {
      success = true;
      score = calculateScore(state.moves.length, duration, (session.difficulty || 'beginner') as NumberMazeDifficultyLevel);
    }

    state.success = success;

    const updatedSession = await prisma.gameSession.update({
      where: { sessionId },
      data: {
        completed: true,
        completedAt,
        score,
        duration,
        state: JSON.stringify(state)
      }
    });

    return mapToSession(updatedSession);
  }

  return mapToSession(session);
}

/**
 * Get user's maze statistics
 */
export async function getUserMazeStats(userId: string): Promise<NumberMazeStats> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'number-maze' }
  });

  if (dbSessions.length === 0) {
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

  const sessions = dbSessions.map(mapToSession);
  const completedSessions = sessions.filter(s => s.completed);
  const successfulSessions = sessions.filter(s => s.success);

  const totalMazesAttempted = sessions.length;
  const totalMazesCompleted = completedSessions.length;
  const completionRate = (totalMazesCompleted / totalMazesAttempted) * 100;

  const allMoves = successfulSessions.map(s => s.moveCount);
  const averageMoves = allMoves.length > 0
    ? allMoves.reduce((sum, m) => sum + m, 0) / allMoves.length
    : 0;
  const bestMoves = allMoves.length > 0 ? Math.min(...allMoves) : 0;

  const allTimes = successfulSessions.map(s => s.timeElapsed);
  const averageTime = allTimes.length > 0
    ? allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length
    : 0;
  const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;

  const allScores = successfulSessions.map(s => s.score);
  const averageScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0;
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

  const perfectSolves = successfulSessions.filter(s => s.moveCount <= 8).length;

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
      if (operationCount[move.operation as MazeOperation] !== undefined) {
        operationCount[move.operation as MazeOperation]++;
      }
    });
  });
  const favoriteOperations = (Object.keys(operationCount) as MazeOperation[])
    .sort((a, b) => operationCount[b] - operationCount[a])
    .slice(0, 3);

  const difficultyStats: Record<NumberMazeDifficultyLevel, { total: number; completed: number }> = {
    beginner: { total: 0, completed: 0 },
    intermediate: { total: 0, completed: 0 },
    advanced: { total: 0, completed: 0 },
    expert: { total: 0, completed: 0 },
    master: { total: 0, completed: 0 }
  };
  sessions.forEach(s => {
    if (difficultyStats[s.difficulty]) {
      difficultyStats[s.difficulty].total++;
      if (s.success) difficultyStats[s.difficulty].completed++;
    }
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
    currentStreak: 0,
    bestStreak: 0
  };
}

/**
 * Get operation statistics
 */
export async function getOperationStats(userId: string): Promise<OperationStats[]> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'number-maze' }
  });

  const sessions = dbSessions.map(mapToSession);

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
      if (stats[op]) {
        stats[op].used++;
        operationsUsed.add(op);
        stats[op].totalImpact += Math.abs(move.resultValue);
      }
    });

    if (session.success) {
      operationsUsed.forEach(op => {
        if (stats[op]) {
          stats[op].successfulSessions++;
        }
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
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'number-maze' },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return dbSessions.map(mapToSession);
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.gameSession.deleteMany({
    where: {
      game: 'number-maze',
      completed: false,
      createdAt: { lt: cutoffDate }
    }
  });

  return result.count;
}
