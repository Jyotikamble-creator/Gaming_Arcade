import { NextRequest, NextResponse } from 'next/server';
import SudokuSession from '@/models/games/sudoku';

/**
 * GET /api/sudoku/stats
 * Get Sudoku statistics and leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const userId = searchParams.get('userId');

    let response: any = {};

    // Get leaderboard
    response.leaderboard = await SudokuSession.getLeaderboard(
      difficulty as any,
      limit
    );

    // Get user stats if userId provided
    if (userId) {
      const userStats = await SudokuSession.getUserStats(userId);
      response.userStats = userStats[0] || null;
      
      // Get user's recent sessions
      response.recentSessions = await SudokuSession.findByUser(userId, 10);
    }

    // Get difficulty breakdown stats
    response.difficultyStats = await SudokuSession.getDifficultyStats();

    // Get global stats
    const globalStats = await SudokuSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          solvedSessions: { 
            $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          averageTime: { $avg: '$timeElapsed' },
          bestTime: { $min: '$timeElapsed' },
          totalHintsUsed: { $sum: '$hintsUsed' },
          totalMistakes: { $sum: '$mistakes' },
          averageCompletion: { $avg: '$completion' },
          uniquePlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalSessions: 1,
          solvedSessions: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$solvedSessions', '$totalSessions'] }, 100] },
              1
            ]
          },
          averageScore: { $round: ['$averageScore', 0] },
          highestScore: 1,
          averageTime: { $round: ['$averageTime', 0] },
          bestTime: 1,
          totalHintsUsed: 1,
          totalMistakes: 1,
          averageCompletion: { $round: ['$averageCompletion', 1] },
          totalPlayers: { $size: '$uniquePlayers' }
        }
      }
    ]);

    response.globalStats = globalStats[0] || {
      totalSessions: 0,
      solvedSessions: 0,
      completionRate: 0,
      averageScore: 0,
      highestScore: 0,
      averageTime: 0,
      bestTime: 0,
      totalHintsUsed: 0,
      totalMistakes: 0,
      averageCompletion: 0,
      totalPlayers: 0
    };

    // Get puzzle statistics
    const puzzleStats = await SudokuSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: '$puzzleId',
          attempts: { $sum: 1 },
          solves: { $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] } },
          averageTime: { $avg: '$timeElapsed' },
          bestTime: { $min: '$timeElapsed' },
          difficulty: { $first: '$difficulty' }
        }
      },
      {
        $project: {
          puzzleId: '$_id',
          attempts: 1,
          solves: 1,
          solveRate: {
            $round: [
              { $multiply: [{ $divide: ['$solves', '$attempts'] }, 100] },
              1
            ]
          },
          averageTime: { $round: ['$averageTime', 0] },
          bestTime: 1,
          difficulty: 1
        }
      },
      { $sort: { attempts: -1 } },
      { $limit: 20 }
    ]);

    response.puzzleStats = puzzleStats;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Sudoku stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get statistics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}