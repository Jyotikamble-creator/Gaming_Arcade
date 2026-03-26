/**
 * PostgreSQL Score model using Prisma
 * Provides database operations for game scores and leaderboard
 */

import { prisma } from '@/lib/mongodb';
import type { Score } from '@prisma/client';

export interface IScore extends Score {}

/**
 * Create a new score record
 */
export async function createScore(data: {
  game: string;
  userId?: string;
  playerName?: string;
  score: number;
  meta?: Record<string, any>;
}) {
  return prisma.score.create({
    data: {
      game: data.game,
      userId: data.userId || undefined,
      playerName: data.playerName || 'guest',
      score: data.score,
      meta: data.meta || {},
    },
    include: { user: true },
  });
}

/**
 * Get leaderboard for a specific game
 */
export async function getGameLeaderboard(game: string, limit: number = 10) {
  return prisma.score.findMany({
    where: { game },
    orderBy: { score: 'desc' },
    take: limit,
    include: { user: true },
  });
}

/**
 * Get user's scores for a game
 */
export async function getUserScores(userId: string, game?: string, limit: number = 10) {
  return prisma.score.findMany({
    where: {
      userId,
      ...(game && { game }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true },
  });
}

/**
 * Get top score for a user in a game
 */
export async function getTopScoreForGame(userId: string, game: string) {
  return prisma.score.findFirst({
    where: {
      userId,
      game,
    },
    orderBy: { score: 'desc' },
    include: { user: true },
  });
}

/**
 * Get global leaderboard across all games
 */
export async function getGlobalLeaderboard(limit: number = 10) {
  return prisma.score.findMany({
    orderBy: { score: 'desc' },
    take: limit,
    include: { user: true },
  });
}

/**
 * Get all-time high scores per user per game
 */
export async function getAllTimeHighScores(game: string, limit: number = 10) {
  const scores = await prisma.score.findMany({
    where: { game },
    orderBy: { score: 'desc' },
    take: 1000,
    include: { user: true },
  });

  // Get unique scores per player (keep highest)
  const uniqueScores = new Map();
  scores.forEach((score) => {
    const key = score.userId || score.playerName;
    if (!uniqueScores.has(key) || uniqueScores.get(key).score < score.score) {
      uniqueScores.set(key, score);
    }
  });

  return Array.from(uniqueScores.values()).slice(0, limit);
}

/**
 * Get recent scores
 */
export async function getRecentScores(limit: number = 20) {
  return prisma.score.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true },
  });
}

/**
 * Delete score record
 */
export async function deleteScore(id: string) {
  return prisma.score.delete({
    where: { id },
  });
}

/**
 * Update score record
 */
export async function updateScore(id: string, data: Partial<Omit<Score, 'id' | 'createdAt'>>) {
  return prisma.score.update({
    where: { id },
    data,
    include: { user: true },
  });
}

// Default export for backwards compatibility
export default {
  createScore,
  getGameLeaderboard,
  getUserScores,
  getTopScoreForGame,
  getGlobalLeaderboard,
  getAllTimeHighScores,
  getRecentScores,
  deleteScore,
  updateScore,
};

