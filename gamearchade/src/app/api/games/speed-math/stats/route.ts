import { NextRequest, NextResponse } from 'next/server';
import SpeedMathSession from '@/models/games/speed-math';

/**
 * GET /api/speed-math/stats
 * Get speed math statistics and leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const userId = searchParams.get('userId');

    let response: any = {};

    // Get leaderboard
    response.leaderboard = await SpeedMathSession.getLeaderboard(
      difficulty as any,
      limit
    );

    // Get user stats if userId provided
    if (userId) {
      const userStats = await SpeedMathSession.getUserStats(userId);
      response.userStats = userStats[0] || null;
      
      // Get user's recent sessions
      response.recentSessions = await SpeedMathSession.findByUser(userId, 10);
    }

    // Get difficulty breakdown stats
    response.difficultyStats = await SpeedMathSession.getDifficultyStats();

    // Get global stats
    const globalStats = await SpeedMathSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          averageScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          averageAccuracy: { $avg: '$accuracy' },
          averageQPM: { $avg: '$questionsPerMinute' },
          longestStreak: { $max: '$longestStreak' },
          uniquePlayers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalSessions: 1,
          totalQuestions: 1,
          averageAccuracy: {
            $round: [
              { $multiply: [{ $divide: ['$totalCorrectAnswers', '$totalQuestions'] }, 100] },
              1
            ]
          },
          averageScore: { $round: ['$averageScore', 0] },
          highestScore: 1,
          averageQPM: { $round: ['$averageQPM', 1] },
          longestStreak: 1,
          totalPlayers: { $size: '$uniquePlayers' }
        }
      }
    ]);

    response.globalStats = globalStats[0] || {
      totalSessions: 0,
      totalQuestions: 0,
      averageAccuracy: 0,
      averageScore: 0,
      highestScore: 0,
      averageQPM: 0,
      longestStreak: 0,
      totalPlayers: 0
    };

    // Get operation statistics
    const operationStats = await SpeedMathSession.aggregate([
      { $match: { isCompleted: true } },
      { $unwind: '$answers' },
      {
        $lookup: {
          from: 'speed_math_sessions',
          let: { sessionId: '$sessionId', problemIndex: '$answers.problemIndex' },
          pipeline: [
            { $match: { $expr: { $eq: ['$sessionId', '$$sessionId'] } } },
            { $unwind: '$problems' },
            { $match: { $expr: { $eq: [{ $indexOfArray: ['$problems', '$problems'] }, '$$problemIndex'] } } },
            { $project: { operation: '$problems.operation' } }
          ],
          as: 'problemData'
        }
      },
      { $unwind: '$problemData' },
      {
        $group: {
          _id: '$problemData.operation',
          totalAttempts: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
          averageTime: { $avg: '$answers.timeElapsed' }
        }
      },
      {
        $project: {
          operation: '$_id',
          totalAttempts: 1,
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
              1
            ]
          },
          averageTime: { $round: ['$averageTime', 1] }
        }
      }
    ]);

    response.operationStats = operationStats;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Speed math stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get statistics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}