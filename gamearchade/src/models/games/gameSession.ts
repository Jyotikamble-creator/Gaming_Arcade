/**
 * PostgreSQL Game Session model using Prisma
 * Provides database operations for game session management
 */

import { prisma } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export interface IGameSession {
  sessionId: string;
  game: string;
  userId?: string;
  difficulty?: string;
  gameMode?: string;
  category?: string;
  state: Record<string, any>;
  meta: Record<string, any>;
  score?: number;
  duration?: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

/**
 * Create a new game session
 */
export async function createGameSession(data: {
  game: string;
  userId?: string;
  difficulty?: string;
  gameMode?: string;
  category?: string;
  state?: Record<string, any>;
  meta?: Record<string, any>;
}) {
  return prisma.gameSession.create({
    data: {
      sessionId: uuidv4(),
      game: data.game,
      userId: data.userId,
      difficulty: data.difficulty,
      gameMode: data.gameMode,
      category: data.category,
      state: data.state || {},
      meta: data.meta || {},
    },
  });
}

/**
 * Get game session by ID
 */
export async function getGameSession(sessionId: string) {
  return prisma.gameSession.findUnique({
    where: { sessionId },
  });
}

/**
 * Get user's active game sessions
 */
export async function getUserGameSessions(userId: string, game?: string) {
  const where: any = {
    userId,
    completed: false,
  };

  if (game) {
    where.game = game;
  }

  return prisma.gameSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Update game session state
 */
export async function updateGameSessionState(
  sessionId: string,
  state: Record<string, any>
) {
  return prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: {
        ...(await getGameSession(sessionId))?.state,
        ...state,
      },
      updatedAt: new Date(),
    },
  });
}

/**
 * Update game session metadata
 */
export async function updateGameSessionMeta(
  sessionId: string,
  meta: Record<string, any>
) {
  return prisma.gameSession.update({
    where: { sessionId },
    data: {
      meta: {
        ...(await getGameSession(sessionId))?.meta,
        ...meta,
      },
      updatedAt: new Date(),
    },
  });
}

/**
 * Complete a game session
 */
export async function completeGameSession(
  sessionId: string,
  score: number,
  meta?: Record<string, any>
) {
  const session = await getGameSession(sessionId);
  if (!session) throw new Error('Session not found');

  const duration = Date.now() - session.startedAt.getTime();

  return prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt: new Date(),
      score,
      duration,
      meta: meta ? { ...(session.meta as any), ...meta } : session.meta,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get game session statistics
 */
export async function getGameSessionStats(game: string) {
  const sessions = await prisma.gameSession.findMany({
    where: { game, completed: true },
  });

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      highestScore: 0,
      averageDuration: 0,
    };
  }

  const scores = sessions.map((s: any) => s.score);
  const durations = sessions.map((s: any) => s.duration || 0);

  return {
    totalSessions: sessions.length,
    averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
    highestScore: Math.max(...scores),
    averageDuration: Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length),
  };
}

/**
 * Delete game session
 */
export async function deleteGameSession(sessionId: string) {
  return prisma.gameSession.delete({
    where: { sessionId },
  });
}

export default {
  createGameSession,
  getGameSession,
  getUserGameSessions,
  updateGameSessionState,
  updateGameSessionMeta,
  completeGameSession,
  getGameSessionStats,
  deleteGameSession,
};
