/**
 * PostgreSQL Memory Game Session model using Prisma
 * Handles memory card game sessions
 */

import { prisma } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export interface IMemoryGameSession {
  sessionId: string;
  userId?: string;
  difficulty: string;
  theme: string;
  cards: any[];
  totalPairs: number;
  flips: any[];
  matches: number;
  moves: number;
  score: number;
  completed: boolean;
  state?: Record<string, any>;
  meta?: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

/**
 * Create a new memory game session
 */
export async function createMemoryGameSession(data: {
  userId?: string;
  difficulty: string;
  theme: string;
  cards: any[];
  totalPairs: number;
  state?: Record<string, any>;
  meta?: Record<string, any>;
}) {
  return prisma.memoryGameSession.create({
    data: {
      sessionId: uuidv4(),
      userId: data.userId,
      difficulty: data.difficulty,
      theme: data.theme,
      cards: data.cards,
      totalPairs: data.totalPairs,
      state: data.state || {},
      meta: data.meta || {},
    },
  });
}

/**
 * Get memory game session by ID
 */
export async function getMemoryGameSession(sessionId: string) {
  return prisma.memoryGameSession.findUnique({
    where: { sessionId },
  });
}

/**
 * Get user's active memory game sessions
 */
export async function getUserMemoryGameSessions(userId: string) {
  return prisma.memoryGameSession.findMany({
    where: {
      userId,
      completed: false,
    },
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Record card flip
 */
export async function recordCardFlip(
  sessionId: string,
  cardId: number,
  isMatch: boolean,
  pairId: number
) {
  const session = await getMemoryGameSession(sessionId);
  if (!session) throw new Error('Session not found');

  const flips = (session.flips as any) || [];
  flips.push({
    cardId,
    timestamp: new Date(),
    wasMatch: isMatch,
    pairId,
  });

  const newMatches = isMatch ? session.matches + 1 : session.matches;

  return prisma.memoryGameSession.update({
    where: { sessionId },
    data: {
      flips,
      matches: newMatches,
      moves: { increment: 1 },
      updatedAt: new Date(),
    },
  });
}

/**
 * Update memory game score
 */
export async function updateMemoryGameScore(sessionId: string, score: number) {
  return prisma.memoryGameSession.update({
    where: { sessionId },
    data: {
      score,
      updatedAt: new Date(),
    },
  });
}

/**
 * Complete memory game session
 */
export async function completeMemoryGameSession(
  sessionId: string,
  finalScore: number,
  meta?: Record<string, any>
) {
  const session = await getMemoryGameSession(sessionId);
  if (!session) throw new Error('Session not found');

  return prisma.memoryGameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt: new Date(),
      score: finalScore,
      meta: meta ? { ...(session.meta as any), ...meta } : session.meta,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get memory game statistics for user
 */
export async function getUserMemoryGameStats(userId: string) {
  const sessions = await prisma.memoryGameSession.findMany({
    where: {
      userId,
      completed: true,
    },
  });

  if (sessions.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      averageMoves: 0,
      bestMoves: 0,
      perfectGames: 0,
    };
  }

  const scores = sessions.map((s: any) => s.score);
  const moves = sessions.map((s: any) => s.moves);
  const perfectGames = sessions.filter((s: any) => s.moves === s.totalPairs).length;

  return {
    totalGames: sessions.length,
    averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    averageMoves: Math.round(moves.reduce((a: number, b: number) => a + b, 0) / moves.length),
    bestMoves: Math.min(...moves),
    perfectGames,
  };
}

/**
 * Delete memory game session
 */
export async function deleteMemoryGameSession(sessionId: string) {
  return prisma.memoryGameSession.delete({
    where: { sessionId },
  });
}

export default {
  createMemoryGameSession,
  getMemoryGameSession,
  getUserMemoryGameSessions,
  recordCardFlip,
  updateMemoryGameScore,
  completeMemoryGameSession,
  getUserMemoryGameStats,
  deleteMemoryGameSession,
};
