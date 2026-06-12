// Helper functions for Score and Leaderboard operations using Prisma Client
import { prisma } from '@/lib/api/prisma';
import { 
  IScore, 
  LeaderboardEntry,
  ScoreFilterOptions,
  PaginationOptions,
  GameStats,
  PlayerStats
} from '@/types/common/score';
import { validateScoreData as validateScoreDataUtil } from '@/utility/common/score';

// Re-export validation function
export { validateScoreData } from '@/utility/common/score';

/**
 * Create a new score entry
 */
export async function createScore(
  game: string,
  score: number,
  playerName: string = 'guest',
  meta: Record<string, any> = {},
  userId?: string
): Promise<IScore> {
  const newScore = await prisma.score.create({
    data: {
      game,
      score,
      playerName,
      meta: JSON.stringify(meta),
      userId: userId || null,
    }
  });
  
  return {
    _id: newScore.id,
    game: newScore.game,
    playerName: newScore.playerName,
    score: newScore.score,
    meta: JSON.parse(newScore.meta),
    createdAt: newScore.createdAt,
  } as unknown as IScore;
}

/**
 * Get leaderboard for a specific game
 */
export async function getLeaderboard(
  game: string = 'word-guess',
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const scores = await prisma.score.findMany({
    where: { game },
    orderBy: [
      { score: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit,
    include: {
      user: {
        select: {
          username: true,
          displayName: true
        }
      }
    }
  });
  
  return scores.map((score, index) => ({
    _id: score.id,
    game: score.game,
    playerName: score.playerName,
    score: score.score,
    meta: JSON.parse(score.meta),
    createdAt: score.createdAt,
    rank: index + 1,
    user: score.user || undefined,
  } as unknown as LeaderboardEntry));
}

/**
 * Get scores for a specific user
 */
export async function getUserScores(
  userId: string,
  game?: string,
  limit: number = 100
): Promise<IScore[]> {
  const where: any = { userId };
  if (game) {
    where.game = game;
  }
  
  const scores = await prisma.score.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return scores.map(score => ({
    _id: score.id,
    game: score.game,
    playerName: score.playerName,
    score: score.score,
    meta: JSON.parse(score.meta),
    createdAt: score.createdAt,
  } as unknown as IScore));
}

/**
 * Get scores with filters and pagination
 */
export async function getScoresFiltered(
  filters: ScoreFilterOptions = {},
  pagination: PaginationOptions = {}
): Promise<{ scores: IScore[]; total: number }> {
  const where: any = {};
  
  // Apply filters
  if (filters.game) where.game = filters.game;
  if (filters.playerName) {
    where.playerName = {
      contains: filters.playerName,
      mode: 'insensitive'
    };
  }
  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    where.score = {};
    if (filters.minScore !== undefined) where.score.gte = filters.minScore;
    if (filters.maxScore !== undefined) where.score.lte = filters.maxScore;
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }
  
  // Pagination
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;
  
  // Sort
  const sortField = pagination.sortBy || 'score';
  const sortOrder = pagination.sortOrder === 'asc' ? 'asc' : 'desc';
  
  const [scores, total] = await Promise.all([
    prisma.score.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.score.count({ where }),
  ]);
  
  const parsedScores = scores.map(score => ({
    _id: score.id,
    game: score.game,
    playerName: score.playerName,
    score: score.score,
    meta: JSON.parse(score.meta),
    createdAt: score.createdAt,
  } as unknown as IScore));
  
  return { scores: parsedScores, total };
}

/**
 * Get game statistics
 */
export async function getGameStats(game: string): Promise<GameStats> {
  const scores = await prisma.score.findMany({
    where: { game }
  });
  
  if (scores.length === 0) {
    return {
      game,
      totalPlayers: 0,
      totalGames: 0,
      highestScore: 0,
      averageScore: 0,
      latestScores: [],
    };
  }
  
  const uniquePlayers = new Set(scores.map(s => s.playerName));
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const highestScore = Math.max(...scores.map(s => s.score));
  
  const latestScores = await prisma.score.findMany({
    where: { game },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  return {
    game,
    totalPlayers: uniquePlayers.size,
    totalGames: scores.length,
    highestScore,
    averageScore: Math.round(totalScore / scores.length),
    latestScores: latestScores.map(s => ({
      _id: s.id,
      game: s.game,
      playerName: s.playerName,
      score: s.score,
      meta: JSON.parse(s.meta),
      createdAt: s.createdAt,
    } as unknown as LeaderboardEntry)),
  };
}

/**
 * Get player statistics across all games
 */
export async function getPlayerStats(playerName: string): Promise<PlayerStats> {
  const scores = await prisma.score.findMany({
    where: { playerName }
  });
  
  if (scores.length === 0) {
    return {
      playerName,
      totalGames: 0,
      highestScore: 0,
      averageScore: 0,
      gamesPlayed: {},
    };
  }
  
  const gamesPlayed: PlayerStats['gamesPlayed'] = {};
  
  scores.forEach(score => {
    if (!gamesPlayed[score.game]) {
      gamesPlayed[score.game] = {
        count: 0,
        bestScore: 0,
        averageScore: 0,
      };
    }
    
    const gameStats = gamesPlayed[score.game];
    gameStats.count++;
    gameStats.bestScore = Math.max(gameStats.bestScore, score.score);
  });
  
  // Calculate averages
  Object.keys(gamesPlayed).forEach(game => {
    const gameScores = scores.filter(s => s.game === game);
    const totalScore = gameScores.reduce((sum, s) => sum + s.score, 0);
    gamesPlayed[game].averageScore = Math.round(totalScore / gameScores.length);
  });
  
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const highestScore = Math.max(...scores.map(s => s.score));
  
  return {
    playerName,
    totalGames: scores.length,
    highestScore,
    averageScore: Math.round(totalScore / scores.length),
    gamesPlayed,
  };
}

/**
 * Get top players across all games
 */
export async function getTopPlayers(limit: number = 10): Promise<Array<{
  playerName: string;
  totalScore: number;
  gamesPlayed: number;
}>> {
  const aggregations = await prisma.score.groupBy({
    by: ['playerName'],
    _sum: {
      score: true
    },
    _count: {
      id: true
    },
    orderBy: {
      _sum: {
        score: 'desc'
      }
    },
    take: limit
  });
  
  return aggregations.map(agg => ({
    playerName: agg.playerName,
    totalScore: agg._sum.score || 0,
    gamesPlayed: agg._count.id
  }));
}

/**
 * Delete old scores (cleanup utility)
 */
export async function deleteOldScores(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await prisma.score.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  });
  
  return result.count;
}
