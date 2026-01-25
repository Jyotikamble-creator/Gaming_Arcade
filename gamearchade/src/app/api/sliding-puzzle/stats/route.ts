import { NextRequest, NextResponse } from 'next/server';
import SlidingPuzzleSession from '@/models/games/sliding-puzzle';

/**
 * GET /api/sliding-puzzle/stats
 * Get sliding puzzle statistics and leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const puzzleSize = searchParams.get('puzzleSize') ? 
      parseInt(searchParams.get('puzzleSize')!) : undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const userId = searchParams.get('userId');

    let response: any = {};

    // Get leaderboard
    response.leaderboard = await SlidingPuzzleSession.getLeaderboard(
      difficulty as any,
      puzzleSize,
      limit
    );

    // Get user stats if userId provided
    if (userId) {
      const userStats = await SlidingPuzzleSession.getUserStats(userId);
      response.userStats = userStats[0] || null;
      
      // Get user's recent games
      response.recentGames = await SlidingPuzzleSession.findByUser(userId, 10);
    }

    // Get difficulty breakdown stats
    response.difficultyStats = await SlidingPuzzleSession.getDifficultyStats();

    // Get global stats
    const globalStats = await SlidingPuzzleSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          solvedGames: { 
            $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          averageMoves: { $avg: '$moves' },
          bestMoves: { $min: '$moves' },
          averageTime: { $avg: '$timeElapsed' },
          bestTime: { $min: '$timeElapsed' },
          uniquePlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalGames: 1,
          solvedGames: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$solvedGames', '$totalGames'] }, 100] },
              1
            ]
          },
          averageScore: { $round: ['$averageScore', 0] },
          highestScore: 1,
          averageMoves: { $round: ['$averageMoves', 0] },
          bestMoves: 1,
          averageTime: { $round: ['$averageTime', 0] },
          bestTime: 1,
          totalPlayers: { $size: '$uniquePlayers' }
        }
      }
    ]);

    response.globalStats = globalStats[0] || {
      totalGames: 0,
      solvedGames: 0,
      completionRate: 0,
      averageScore: 0,
      highestScore: 0,
      averageMoves: 0,
      bestMoves: 0,
      averageTime: 0,
      bestTime: 0,
      totalPlayers: 0
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Sliding puzzle stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get statistics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}