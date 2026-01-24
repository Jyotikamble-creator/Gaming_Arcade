/**
 * API Route: Get user's math quiz statistics
 * GET /api/games/math/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserQuizStats, getOperationStats } from '@/lib/games/math';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Get user statistics
    const stats = await getUserQuizStats(userId);
    const operationStats = await getOperationStats(userId);

    console.log('[MATH] Retrieved stats for user:', userId);

    return NextResponse.json({
      ...stats,
      operationStats
    }, { status: 200 });

  } catch (error) {
    console.error('[MATH] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
