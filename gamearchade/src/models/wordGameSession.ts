/**
 * PostgreSQL Word Game Session model using Prisma
 * Handles word scramble, word builder, word guess sessions
 */

import { prisma } from '@/lib/mongodb';
import type { WordGameSession } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface IWordGameSession extends WordGameSession {}

/**
 * Create a new word game session
 */
export async function createWordGameSession(data: {
  gameType: string; // word-scramble, word-builder, word-guess
  userId?: string;
  difficulty?: string;
  category?: string;
  words: string[];
  state?: Record<string, any>;
  meta?: Record<string, any>;
}) {
  return prisma.wordGameSession.create({
    data: {
      sessionId: uuidv4(),
      gameType: data.gameType,
      userId: data.userId,
      difficulty: data.difficulty || 'medium',
      category: data.category,
      words: data.words,
      currentWordIndex: 0,
      score: 0,
      state: data.state || {},
      meta: data.meta || {},
    },
  });
}

/**
 * Get word game session by ID
 */
export async function getWordGameSession(sessionId: string) {
  return prisma.wordGameSession.findUnique({
    where: { sessionId },
  });
}

/**
 * Get user's active word game sessions
 */
export async function getUserWordGameSessions(userId: string, gameType?: string) {
  const where: any = {
    userId,
    completed: false,
  };

  if (gameType) {
    where.gameType = gameType;
  }

  return prisma.wordGameSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Update word game session score
 */
export async function updateWordGameScore(
  sessionId: string,
  score: number,
  correctGuesses?: number
) {
  return prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      score,
      correctGuesses,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update word game session moves
 */
export async function updateWordGameMoves(sessionId: string, moves: number) {
  return prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      moves,
      updatedAt: new Date(),
    },
  });
}

/**
 * Add hint usage
 */
export async function addHintUsage(sessionId: string) {
  return prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      hintsUsed: { increment: 1 },
      updatedAt: new Date(),
    },
  });
}

/**
 * Update current word index
 */
export async function updateCurrentWord(sessionId: string, index: number) {
  return prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      currentWordIndex: index,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update game state
 */
export async function updateWordGameState(
  sessionId: string,
  state: Record<string, any>
) {
  const session = await getWordGameSession(sessionId);
  if (!session) throw new Error('Session not found');

  return prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      state: {
        ...(session.state as any),
        ...state,
      },
      updatedAt: new Date(),
    },
  });
}

/**
 * Complete a word game session
 */
export async function completeWordGameSession(
  sessionId: string,
  finalScore: number,
  meta?: Record<string, any>
) {
  const session = await getWordGameSession(sessionId);
  if (!session) throw new Error('Session not found');

  return prisma.wordGameSession.update({
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
 * Get word game statistics for user
 */
export async function getUserWordGameStats(userId: string, gameType: string) {
  const sessions = await prisma.wordGameSession.findMany({
    where: {
      userId,
      gameType,
      completed: true,
    },
  });

  if (sessions.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      totalWords: 0,
      correctGuesses: 0,
    };
  }

  const scores = sessions.map((s) => s.score);
  const correctGuesses = sessions.reduce((sum, s) => sum + s.correctGuesses, 0);

  return {
    totalGames: sessions.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    totalWords: sessions.reduce((sum, s) => sum + s.words.length, 0),
    correctGuesses,
  };
}

/**
 * Delete word game session
 */
export async function deleteWordGameSession(sessionId: string) {
  return prisma.wordGameSession.delete({
    where: { sessionId },
  });
}

export default {
  createWordGameSession,
  getWordGameSession,
  getUserWordGameSessions,
  updateWordGameScore,
  updateWordGameMoves,
  addHintUsage,
  updateCurrentWord,
  updateWordGameState,
  completeWordGameSession,
  getUserWordGameStats,
  deleteWordGameSession,
};
