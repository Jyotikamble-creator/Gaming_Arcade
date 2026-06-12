/**
 * API Route: Get user achievements
 * GET /api/progress/achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/auth';
import { getUserProgress, getStreakInfo } from '@/lib/progress';
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

    // Get user progress
    const progress = await getUserProgress(userId);
    const streak = await getStreakInfo(userId);

    // Check achievements
    const achievements = checkAchievements(
      progress.totalGames,
      progress.bestScores,
      streak.currentStreak,
      progress.gamesPlayed
    );

    // Separate unlocked and locked achievements
    const unlocked = achievements.filter(a => a.unlockedAt);
    const locked = achievements.filter(a => !a.unlockedAt);

    console.log('[PROGRESS] Achievements retrieved:', {
      userId,
      totalAchievements: achievements.length,
      unlocked: unlocked.length
    });

    return NextResponse.json({
      achievements,
      unlocked,
      locked,
      totalAchievements: achievements.length,
      unlockedCount: unlocked.length,
      progress: Math.round((unlocked.length / achievements.length) * 100)
    }, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error fetching achievements:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
