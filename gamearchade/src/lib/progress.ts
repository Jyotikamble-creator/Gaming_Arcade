/**
 * Game logic and database operations for User Progress
 */

import ScoreModel from '@/models/common/score';
import type {
  UserProgress,
  GameStats,
  RecentScore,
  StreakInfo,
  ProgressOverTime,
  TimePeriod,
  GameType,
  SummaryStats,
  UserRank,
  CategoryStats
} from '@/types/progress';

/**
 * Get user's progress summary
 */
export async function getUserProgress(
  userId: string,
  limit: number = 100
): Promise<UserProgress> {
  // Fetch user's scores
  const scores = await ScoreModel
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (scores.length === 0) {
    return {
      userId,
      totalGames: 0,
      gamesPlayed: {} as Record<GameType, number>,
      bestScores: {} as Record<GameType, number>,
      recentScores: []
    };
  }

  // Calculate statistics
  const totalGames = scores.length;
  const gamesPlayed: Record<string, number> = {};
  const bestScores: Record<string, number> = {};

  scores.forEach(score => {
    const game = score.game;
    gamesPlayed[game] = (gamesPlayed[game] || 0) + 1;
    
    if (!bestScores[game] || score.score > bestScores[game]) {
      bestScores[game] = score.score;
    }
  });

  // Recent scores
  const recentScores: RecentScore[] = scores.slice(0, 10).map(s => ({
    game: s.game as GameType,
    score: s.score,
    createdAt: s.createdAt,
    _id: s._id?.toString()
  }));

  return {
    userId,
    totalGames,
    gamesPlayed: gamesPlayed as Record<GameType, number>,
    bestScores: bestScores as Record<GameType, number>,
    recentScores,
    lastActive: scores[0]?.createdAt
  };
}

/**
 * Get detailed game statistics
 */
export async function getGameStats(userId: string): Promise<GameStats[]> {
  const scores = await ScoreModel
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  if (scores.length === 0) return [];

  // Group by game
  const gameGroups: Record<string, typeof scores> = {};
  scores.forEach(score => {
    if (!gameGroups[score.game]) {
      gameGroups[score.game] = [];
    }
    gameGroups[score.game].push(score);
  });

  // Calculate stats for each game
  const gameStats: GameStats[] = Object.entries(gameGroups).map(([game, gameScores]) => {
    const totalPlayed = gameScores.length;
    const bestScore = Math.max(...gameScores.map(s => s.score));
    const averageScore = gameScores.reduce((sum, s) => sum + s.score, 0) / totalPlayed;
    const lastPlayed = gameScores[0].createdAt;

    return {
      game: game as GameType,
      totalPlayed,
      bestScore,
      averageScore: Math.round(averageScore),
      lastPlayed
    };
  });

  return gameStats.sort((a, b) => b.totalPlayed - a.totalPlayed);
}

/**
 * Get user's streak information
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const scores = await ScoreModel
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  if (scores.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: new Date(),
      streakActive: false
    };
  }

  // Calculate streaks (days with at least one game)
  const playDates: string[] = [];
  scores.forEach(score => {
    const dateStr = score.createdAt.toISOString().split('T')[0];
    if (!playDates.includes(dateStr)) {
      playDates.push(dateStr);
    }
  });

  // Sort dates in descending order
  playDates.sort((a, b) => b.localeCompare(a));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if streak is active
  const streakActive = playDates[0] === today || playDates[0] === yesterday;

  // Calculate current streak
  if (streakActive) {
    let checkDate = new Date();
    for (let i = 0; i < playDates.length; i++) {
      const expectedDate = checkDate.toISOString().split('T')[0];
      if (playDates.includes(expectedDate)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 0; i < playDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(playDates[i - 1]);
      const currDate = new Date(playDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastPlayedDate: scores[0].createdAt,
    streakActive
  };
}

/**
 * Get progress over time
 */
export async function getProgressOverTime(
  userId: string,
  period: TimePeriod
): Promise<ProgressOverTime[]> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0); // All time
  }

  const scores = await ScoreModel
    .find({
      user: userId,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: 1 })
    .lean();

  // Group by date
  const dateGroups: Record<string, typeof scores> = {};
  scores.forEach(score => {
    const dateStr = score.createdAt.toISOString().split('T')[0];
    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = [];
    }
    dateGroups[dateStr].push(score);
  });

  // Calculate stats per date
  const progressData: ProgressOverTime[] = Object.entries(dateGroups).map(([date, dayScores]) => {
    const totalScore = dayScores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = Math.round(totalScore / dayScores.length);

    return {
      date,
      gamesPlayed: dayScores.length,
      averageScore,
      totalScore
    };
  });

  return progressData.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get summary statistics
 */
export async function getSummaryStats(userId: string): Promise<SummaryStats> {
  const scores = await ScoreModel
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  if (scores.length === 0) {
    return {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      favoriteGame: 'word-guess' as GameType,
      bestPerformingGame: 'word-guess' as GameType,
      totalPlayTime: 0,
      gamesThisWeek: 0,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayedDate: new Date(),
        streakActive: false
      }
    };
  }

  const totalGamesPlayed = scores.length;
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const averageScore = Math.round(totalScore / totalGamesPlayed);

  // Find favorite game (most played)
  const gameCounts: Record<string, number> = {};
  scores.forEach(s => {
    gameCounts[s.game] = (gameCounts[s.game] || 0) + 1;
  });
  const favoriteGame = (Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'word-guess') as GameType;

  // Find best performing game (highest average score)
  const gameScores: Record<string, number[]> = {};
  scores.forEach(s => {
    if (!gameScores[s.game]) gameScores[s.game] = [];
    gameScores[s.game].push(s.score);
  });
  const gameAverages = Object.entries(gameScores).map(([game, scores]) => ({
    game,
    avg: scores.reduce((sum, s) => sum + s, 0) / scores.length
  }));
  const bestPerformingGame = (gameAverages.sort((a, b) => b.avg - a.avg)[0]?.game || 'word-guess') as GameType;

  // Games this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const gamesThisWeek = scores.filter(s => s.createdAt >= weekAgo).length;

  // Get streak info
  const streak = await getStreakInfo(userId);

  return {
    totalGamesPlayed,
    totalScore,
    averageScore,
    favoriteGame,
    bestPerformingGame,
    totalPlayTime: 0, // TODO: Calculate from game sessions
    gamesThisWeek,
    streak
  };
}

/**
 * Calculate user rank/level based on total XP
 */
export function calculateUserRank(totalGamesPlayed: number, totalScore: number): UserRank {
  // Calculate total XP (games played + score bonus)
  const totalXP = totalGamesPlayed * 10 + Math.floor(totalScore / 100);

  // Level calculation (exponential curve)
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const currentXP = totalXP - xpForCurrentLevel;
  const xpToNextLevel = xpForNextLevel - totalXP;
  const percentToNext = Math.round((currentXP / (xpForNextLevel - xpForCurrentLevel)) * 100);

  // Determine title based on level
  let title: string;
  if (level >= 50) title = 'Legendary Champion';
  else if (level >= 40) title = 'Grand Master';
  else if (level >= 30) title = 'Master';
  else if (level >= 20) title = 'Expert';
  else if (level >= 10) title = 'Advanced Player';
  else if (level >= 5) title = 'Intermediate';
  else title = 'Novice';

  return {
    level,
    title,
    currentXP,
    xpToNextLevel,
    totalXP,
    percentToNext
  };
}

/**
 * Get recent activity (last 30 days)
 */
export async function getRecentActivity(userId: string, days: number = 30): Promise<RecentScore[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const scores = await ScoreModel
    .find({
      user: userId,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .lean();

  return scores.map(s => ({
    game: s.game as GameType,
    score: s.score,
    createdAt: s.createdAt,
    _id: s._id?.toString()
  }));
}
