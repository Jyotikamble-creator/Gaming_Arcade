/**
 * Game logic and database operations for Memory Card Game
 */

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/api/prisma';
import type {
  MemoryGameSession,
  MemoryCard,
  MemoryDifficultyLevel,
  CardTheme,
  MemoryGameStats,
  PerformanceMetrics,
  CardFlip
} from '@/types/games/memory';
import { checkMatch, calculateScore } from '@/utility/games/memory';

function mapToSession(dbSession: any): MemoryGameSession {
  let timeLimit: number | undefined;
  try {
    const meta = JSON.parse(dbSession.meta || '{}');
    if (typeof meta.timeLimit === 'number') {
      timeLimit = meta.timeLimit;
    }
  } catch (e) {}

  return {
    _id: dbSession.id,
    userId: dbSession.userId || undefined,
    sessionId: dbSession.sessionId,
    cards: JSON.parse(dbSession.cards),
    flips: JSON.parse(dbSession.flips),
    matches: dbSession.matches,
    totalPairs: dbSession.totalPairs,
    moves: dbSession.moves,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    completed: dbSession.completed,
    difficulty: dbSession.difficulty as MemoryDifficultyLevel,
    theme: dbSession.theme as CardTheme,
    score: dbSession.score,
    timeLimit,
    createdAt: dbSession.createdAt,
    updatedAt: dbSession.updatedAt,
  };
}

/**
 * Create a new memory game session
 */
export async function createGameSession(
  cards: MemoryCard[],
  difficulty: MemoryDifficultyLevel,
  theme: CardTheme,
  userId?: string,
  timeLimit?: number
): Promise<MemoryGameSession> {
  const totalPairs = cards.length / 2;

  const session = await prisma.memoryGameSession.create({
    data: {
      userId: userId || null,
      sessionId: uuidv4(),
      cards: JSON.stringify(cards),
      flips: JSON.stringify([]),
      matches: 0,
      totalPairs,
      moves: 0,
      completed: false,
      difficulty,
      theme,
      score: 0,
      meta: JSON.stringify({ timeLimit }),
      startedAt: new Date()
    }
  });

  return mapToSession(session);
}

/**
 * Get a game session by session ID
 */
export async function getGameSession(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await prisma.memoryGameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
}

/**
 * Flip cards and check for match
 */
export async function flipCards(
  sessionId: string,
  cardIds: number[]
): Promise<{ match: boolean; session: MemoryGameSession | null }> {
  const session = await prisma.memoryGameSession.findUnique({
    where: { sessionId }
  });

  if (!session || session.completed) {
    return { match: false, session: session ? mapToSession(session) : null };
  }

  const cards: MemoryCard[] = JSON.parse(session.cards);
  const flips: CardFlip[] = JSON.parse(session.flips);

  const card1 = cards.find(c => c.id === cardIds[0]);
  const card2 = cards.find(c => c.id === cardIds[1]);

  if (!card1 || !card2) {
    return { match: false, session: mapToSession(session) };
  }

  const match = checkMatch(card1, card2);

  if (match) {
    card1.matched = true;
    card2.matched = true;
  }
  card1.flipped = true;
  card2.flipped = true;

  flips.push({
    cardId: cardIds[0],
    timestamp: new Date(),
    wasMatch: match,
    pairCardId: cardIds[1]
  });
  flips.push({
    cardId: cardIds[1],
    timestamp: new Date(),
    wasMatch: match,
    pairCardId: cardIds[0]
  });

  const updatedMatches = session.matches + (match ? 1 : 0);
  const updatedMoves = session.moves + 1;
  const isCompleted = updatedMatches === session.totalPairs;

  let completedAt = session.completedAt;
  let score = session.score;

  if (isCompleted) {
    completedAt = new Date();
    const duration = completedAt.getTime() - session.startedAt.getTime();
    score = calculateScore(updatedMoves, duration, session.totalPairs, session.difficulty as MemoryDifficultyLevel);
  }

  const updatedSession = await prisma.memoryGameSession.update({
    where: { sessionId },
    data: {
      cards: JSON.stringify(cards),
      flips: JSON.stringify(flips),
      matches: updatedMatches,
      moves: updatedMoves,
      completed: isCompleted,
      completedAt,
      score
    }
  });

  return { match, session: mapToSession(updatedSession) };
}

/**
 * Get current game state
 */
export async function getGameState(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await prisma.memoryGameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
}

/**
 * Complete a game session manually
 */
export async function completeGameSession(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await prisma.memoryGameSession.findUnique({
    where: { sessionId }
  });

  if (!session) return null;

  if (!session.completed) {
    const completedAt = new Date();
    const duration = completedAt.getTime() - session.startedAt.getTime();
    const score = calculateScore(session.moves, duration, session.totalPairs, session.difficulty as MemoryDifficultyLevel);

    const updatedSession = await prisma.memoryGameSession.update({
      where: { sessionId },
      data: {
        completed: true,
        completedAt,
        score
      }
    });
    return mapToSession(updatedSession);
  }

  return mapToSession(session);
}

/**
 * Get user's game statistics
 */
export async function getUserGameStats(userId: string): Promise<MemoryGameStats> {
  const dbSessions = await prisma.memoryGameSession.findMany({
    where: { userId }
  });

  if (dbSessions.length === 0) {
    return {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      completionRate: 0,
      averageMoves: 0,
      bestMoves: 0,
      averageTime: 0,
      bestTime: 0,
      averageScore: 0,
      bestScore: 0,
      perfectGames: 0,
      favoriteTheme: 'fruits',
      difficultiesMastered: [],
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const sessions = dbSessions.map(mapToSession);
  const completedSessions = sessions.filter(s => s.completed);
  const totalGamesPlayed = sessions.length;
  const totalGamesCompleted = completedSessions.length;
  const completionRate = (totalGamesCompleted / totalGamesPlayed) * 100;

  const allMoves = completedSessions.map(s => s.moves);
  const averageMoves = allMoves.length > 0
    ? allMoves.reduce((sum, m) => sum + m, 0) / allMoves.length
    : 0;
  const bestMoves = allMoves.length > 0 ? Math.min(...allMoves) : 0;

  const allTimes = completedSessions
    .filter(s => s.endTime)
    .map(s => s.endTime!.getTime() - s.startTime.getTime());
  const averageTime = allTimes.length > 0
    ? allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length
    : 0;
  const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;

  const allScores = completedSessions.map(s => s.score);
  const averageScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0;
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

  const perfectGames = completedSessions.filter(s => s.moves === s.totalPairs).length;

  const themeCount: Record<CardTheme, number> = {
    fruits: 0,
    animals: 0,
    emojis: 0,
    numbers: 0,
    letters: 0
  };
  sessions.forEach(s => {
    if (themeCount[s.theme] !== undefined) {
      themeCount[s.theme] += 1;
    }
  });
  const favoriteTheme = (Object.keys(themeCount) as CardTheme[]).reduce((a, b) =>
    themeCount[a] > themeCount[b] ? a : b
  );

  const difficultyStats: Record<MemoryDifficultyLevel, { total: number; completed: number; avgScore: number }> = {
    Easy: { total: 0, completed: 0, avgScore: 0 },
    Medium: { total: 0, completed: 0, avgScore: 0 },
    Hard: { total: 0, completed: 0, avgScore: 0 },
    Expert: { total: 0, completed: 0, avgScore: 0 }
  };

  sessions.forEach(s => {
    if (difficultyStats[s.difficulty]) {
      difficultyStats[s.difficulty].total += 1;
      if (s.completed) {
        difficultyStats[s.difficulty].completed += 1;
        difficultyStats[s.difficulty].avgScore += s.score;
      }
    }
  });

  const difficultiesMastered = (Object.keys(difficultyStats) as MemoryDifficultyLevel[]).filter(
    diff => {
      const stats = difficultyStats[diff];
      const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      const avgScore = stats.completed > 0 ? stats.avgScore / stats.completed : 0;
      return completionRate >= 70 && avgScore >= 700;
    }
  );

  return {
    totalGamesPlayed,
    totalGamesCompleted,
    completionRate,
    averageMoves,
    bestMoves,
    averageTime,
    bestTime,
    averageScore,
    bestScore,
    perfectGames,
    favoriteTheme,
    difficultiesMastered,
    currentStreak: 0,
    bestStreak: 0
  };
}

/**
 * Calculate performance metrics for a session
 */
export function calculatePerformanceMetrics(session: MemoryGameSession): PerformanceMetrics {
  const perfectMoves = session.totalPairs;
  const efficiency = session.moves > 0 ? (perfectMoves / session.moves) * 100 : 0;

  const duration = session.endTime
    ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
    : 0;
  const speed = session.moves > 0 ? duration / session.moves : 0;

  const accuracy = session.moves > 0 ? (session.matches / session.moves) * 100 : 0;

  let rating: PerformanceMetrics['rating'];
  const overallScore = (efficiency + accuracy) / 2;
  if (overallScore >= 90) rating = 'Excellent';
  else if (overallScore >= 75) rating = 'Great';
  else if (overallScore >= 60) rating = 'Good';
  else if (overallScore >= 45) rating = 'Fair';
  else rating = 'Needs Practice';

  return {
    efficiency,
    speed,
    accuracy,
    rating
  };
}

/**
 * Get recent game sessions
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 10
): Promise<MemoryGameSession[]> {
  const dbSessions = await prisma.memoryGameSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return dbSessions.map(mapToSession);
}

/**
 * Get leaderboard by best score
 */
export async function getLeaderboard(limit: number = 10): Promise<any[]> {
  const topSessions = await prisma.memoryGameSession.findMany({
    where: { completed: true },
    orderBy: [
      { score: 'desc' },
      { moves: 'asc' }
    ],
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true
        }
      }
    }
  });

  return topSessions;
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.memoryGameSession.deleteMany({
    where: {
      completed: false,
      createdAt: { lt: cutoffDate }
    }
  });

  return result.count;
}
