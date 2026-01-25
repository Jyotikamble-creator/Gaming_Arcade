import { NextRequest, NextResponse } from 'next/server';
import SimonSession from '@/models/games/simon';

/**
 * GET /api/simon/stats
 * Get Simon game statistics and leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const userId = searchParams.get('userId');

    let response: any = {};

    // Get leaderboard
    response.leaderboard = await SimonSession.getLeaderboard(difficulty, limit);

    // Get user stats if userId provided
    if (userId) {
      const userStats = await SimonSession.getUserStats(userId);
      response.userStats = userStats[0] || null;
      
      // Get user's recent games
      response.recentGames = await SimonSession.findByUser(userId, 10);
    }

    // Get global stats
    const globalStats = await SimonSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          totalPlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalGames: 1,
          averageScore: { $round: ['$averageScore', 0] },
          highestScore: 1,
          totalPlayers: { $size: '$totalPlayers' }
        }
      }
    ]);

    response.globalStats = globalStats[0] || {
      totalGames: 0,
      averageScore: 0,
      highestScore: 0,
      totalPlayers: 0
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Simon stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get statistics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}