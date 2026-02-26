// Helper functions for Score and Leaderboard operations
import { connectDB } from '@/models/db';
import ScoreModel from '@/models/common/score';
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
  await connectDB();
  
  const scoreData: any = {
    game,
    score,
    playerName,
    meta,
  };
  
  if (userId) {
    scoreData.user = userId;
  }
  
  const newScore = await ScoreModel.create(scoreData);
  return newScore;
}

/**
 * Get leaderboard for a specific game
 */
export async function getLeaderboard(
  game: string = 'word-guess',
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  await connectDB();
  
  const scores = await ScoreModel.find({ game })
    .sort({ score: -1, createdAt: 1 })
    .limit(limit)
    .populate('user', 'username displayName')
    .lean();
  
  // Add ranks
  return scores.map((score, index) => ({
    ...score,
    _id: score._id.toString(),
    rank: index + 1,
  } as LeaderboardEntry));
}

/**
 * Get scores for a specific user
 */
export async function getUserScores(
  userId: string,
  game?: string,
  limit: number = 100
): Promise<IScore[]> {
  await connectDB();
  
  const query: any = { user: userId };
  if (game) {
    query.game = game;
  }
  
  const scores = await ScoreModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  
  return scores;
}

/**
 * Get scores with filters and pagination
 */
export async function getScoresFiltered(
  filters: ScoreFilterOptions = {},
  pagination: PaginationOptions = {}
): Promise<{ scores: IScore[]; total: number }> {
  await connectDB();
  
  const query: any = {};
  
  // Apply filters
  if (filters.game) query.game = filters.game;
  if (filters.playerName) query.playerName = { $regex: filters.playerName, $options: 'i' };
  if (filters.minScore !== undefined) query.score = { ...query.score, $gte: filters.minScore };
  if (filters.maxScore !== undefined) query.score = { ...query.score, $lte: filters.maxScore };
  if (filters.startDate) query.createdAt = { ...query.createdAt, $gte: filters.startDate };
  if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: filters.endDate };
  
  // Pagination
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;
  
  // Sort
  const sortField = pagination.sortBy || 'score';
  const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder as 1 | -1 };
  
  const [scores, total] = await Promise.all([
    ScoreModel.find(query).sort(sort).skip(skip).limit(limit).lean().exec(),
    ScoreModel.countDocuments(query).exec(),
  ]);
  
  return { scores, total };
}

/**
 * Get game statistics
 */
export async function getGameStats(game: string): Promise<GameStats> {
  await connectDB();
  
  const scores = await ScoreModel.find({ game }).lean();
  
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
  
  const latestScores = await ScoreModel.find({ game })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  
  return {
    game,
    totalPlayers: uniquePlayers.size,
    totalGames: scores.length,
    highestScore,
    averageScore: Math.round(totalScore / scores.length),
    latestScores: latestScores.map(s => ({
      ...s,
      _id: s._id.toString(),
    } as LeaderboardEntry)),
  };
}

/**
 * Get player statistics across all games
 */
export async function getPlayerStats(playerName: string): Promise<PlayerStats> {
  await connectDB();
  
  const scores = await ScoreModel.find({ playerName }).lean();
  
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
  await connectDB();
  
  const result = await ScoreModel.aggregate([
    {
      $group: {
        _id: '$playerName',
        totalScore: { $sum: '$score' },
        gamesPlayed: { $sum: 1 },
      },
    },
    {
      $sort: { totalScore: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        playerName: '$_id',
        totalScore: 1,
        gamesPlayed: 1,
      },
    },
  ]);
  
  return result;
}

/**
 * Delete old scores (cleanup utility)
 */
export async function deleteOldScores(daysOld: number = 90): Promise<number> {
  await connectDB();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await ScoreModel.deleteMany({
    createdAt: { $lt: cutoffDate },
  });
  
  return result.deletedCount;
}
