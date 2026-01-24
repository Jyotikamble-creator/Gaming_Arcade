/**
 * Game logic and database operations for Memory Card Game
 */

import { v4 as uuidv4 } from 'uuid';
import MemoryGameSessionModel from '@/models/games/memory';
import type {
  MemoryGameSession,
  MemoryCard,
  MemoryDifficultyLevel,
  CardTheme,
  MemoryGameStats,
  PerformanceMetrics
} from '@/types/games/memory';

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

  const session = await MemoryGameSessionModel.create({
    userId,
    sessionId: uuidv4(),
    cards,
    flips: [],
    matches: 0,
    totalPairs,
    moves: 0,
    startTime: new Date(),
    completed: false,
    difficulty,
    theme,
    score: 0,
    timeLimit
  });

  return session.toObject();
}

/**
 * Get a game session by session ID
 */
export async function getGameSession(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await MemoryGameSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Flip cards and check for match
 */
export async function flipCards(
  sessionId: string,
  cardIds: number[]
): Promise<{ match: boolean; session: MemoryGameSession | null }> {
  const session = await MemoryGameSessionModel.findOne({ sessionId });

  if (!session || session.completed) {
    return { match: false, session: session ? session.toObject() : null };
  }

  const match = session.flipCards(cardIds);
  await session.save();

  return { match, session: session.toObject() };
}

/**
 * Get current game state
 */
export async function getGameState(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await MemoryGameSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Complete a game session manually
 */
export async function completeGameSession(sessionId: string): Promise<MemoryGameSession | null> {
  const session = await MemoryGameSessionModel.findOne({ sessionId });

  if (!session) return null;

  if (!session.completed) {
    session.completed = true;
    session.endTime = new Date();
    session.score = session.calculateScore();
    await session.save();
  }

  return session.toObject();
}

/**
 * Get user's game statistics
 */
export async function getUserGameStats(userId: string): Promise<MemoryGameStats> {
  const sessions = await MemoryGameSessionModel.find({ userId }).lean();

  if (sessions.length === 0) {
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

  const completedSessions = sessions.filter(s => s.completed);
  const totalGamesPlayed = sessions.length;
  const totalGamesCompleted = completedSessions.length;
  const completionRate = (totalGamesCompleted / totalGamesPlayed) * 100;

  // Moves statistics
  const allMoves = completedSessions.map(s => s.moves);
  const averageMoves = allMoves.length > 0
    ? allMoves.reduce((sum, m) => sum + m, 0) / allMoves.length
    : 0;
  const bestMoves = allMoves.length > 0 ? Math.min(...allMoves) : 0;

  // Time statistics
  const allTimes = completedSessions
    .filter(s => s.endTime)
    .map(s => s.endTime!.getTime() - s.startTime.getTime());
  const averageTime = allTimes.length > 0
    ? allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length
    : 0;
  const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;

  // Score statistics
  const allScores = completedSessions.map(s => s.score);
  const averageScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0;
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

  // Perfect games (moves = totalPairs)
  const perfectGames = completedSessions.filter(s => s.moves === s.totalPairs).length;

  // Favorite theme
  const themeCount: Record<CardTheme, number> = {
    fruits: 0,
    animals: 0,
    emojis: 0,
    numbers: 0,
    letters: 0
  };
  sessions.forEach(s => {
    themeCount[s.theme] = (themeCount[s.theme] || 0) + 1;
  });
  const favoriteTheme = (Object.keys(themeCount) as CardTheme[]).reduce((a, b) =>
    themeCount[a] > themeCount[b] ? a : b
  );

  // Mastered difficulties (70% completion rate and avg score > 700)
  const difficultyStats: Record<MemoryDifficultyLevel, { total: number; completed: number; avgScore: number }> = {
    Easy: { total: 0, completed: 0, avgScore: 0 },
    Medium: { total: 0, completed: 0, avgScore: 0 },
    Hard: { total: 0, completed: 0, avgScore: 0 },
    Expert: { total: 0, completed: 0, avgScore: 0 }
  };

  sessions.forEach(s => {
    difficultyStats[s.difficulty].total += 1;
    if (s.completed) {
      difficultyStats[s.difficulty].completed += 1;
      difficultyStats[s.difficulty].avgScore += s.score;
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
    currentStreak: 0, // TODO: Implement streak calculation
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
  const sessions = await MemoryGameSessionModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return sessions;
}

/**
 * Get leaderboard by best score
 */
export async function getLeaderboard(limit: number = 10): Promise<any[]> {
  const topSessions = await MemoryGameSessionModel
    .find({ completed: true })
    .sort({ score: -1, moves: 1 })
    .limit(limit)
    .populate('userId', 'name username')
    .lean();

  return topSessions;
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await MemoryGameSessionModel.deleteMany({
    completed: false,
    createdAt: { $lt: cutoffDate }
  });

  return result.deletedCount;
}
