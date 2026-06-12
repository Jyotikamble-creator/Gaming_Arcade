/**
 * API Route: Get user progress and statistics
 * GET /api/progress/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/auth';
import {
  getUserProgress,
  getGameStats,
  getStreakInfo,
  getSummaryStats,
  calculateUserRank
} from '@/lib/progress';
import { checkAchievements } from '@/utility/progress';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const includeAchievements = searchParams.get('includeAchievements') === 'true';

    // Get user progress
    const progress = await getUserProgress(userId, 100);

    // Prepare response
    const response: any = {
      totalGames: progress.totalGames,
      gamesPlayed: progress.gamesPlayed,
      bestScores: progress.bestScores,
      recentScores: progress.recentScores
    };

    // Include detailed game stats if requested
    if (includeStats) {
      const gameStats = await getGameStats(userId);
      const streak = await getStreakInfo(userId);
      const summary = await getSummaryStats(userId);
      const rank = calculateUserRank(progress.totalGames, Object.values(progress.bestScores).reduce((sum, s) => sum + s, 0));

      response.gameStats = gameStats;
      response.streak = streak;
      response.summary = summary;
      response.rank = rank;
    }

    // Include achievements if requested
    if (includeAchievements) {
      const streak = await getStreakInfo(userId);
      const achievements = checkAchievements(
        progress.totalGames,
        progress.bestScores,
        streak.currentStreak,
        progress.gamesPlayed
      );
      response.achievements = achievements;
    }

    console.log('[PROGRESS] User progress retrieved:', {
      userId,
      totalGames: progress.totalGames
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error fetching user progress:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}
