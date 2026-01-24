/**
 * API Route: Get user's Number Maze statistics
 * GET /api/games/number-maze/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserMazeStats, getOperationStats, getRecentSessions } from '@/lib/games/number-maze';

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

    const stats = await getUserMazeStats(userId);
    const operationStats = await getOperationStats(userId);
    const recentSessions = await getRecentSessions(userId, 5);

    console.log('[NUMBER-MAZE] Retrieved stats for user:', userId);

    return NextResponse.json({
      ...stats,
      operationStats,
      recentMazes: recentSessions.map(s => ({
        sessionId: s.sessionId,
        difficulty: s.difficulty,
        startNumber: s.startNumber,
        targetNumber: s.targetNumber,
        moves: s.moveCount,
        success: s.success,
        score: s.score,
        timeElapsed: s.timeElapsed,
        createdAt: s.createdAt
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
