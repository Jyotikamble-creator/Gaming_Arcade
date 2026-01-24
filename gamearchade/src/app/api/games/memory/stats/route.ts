/**
 * API Route: Get user's memory game statistics
 * GET /api/games/memory/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserGameStats, getRecentSessions } from '@/lib/games/memory';

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

    const stats = await getUserGameStats(userId);
    const recentSessions = await getRecentSessions(userId, 5);

    console.log('[MEMORY] Retrieved stats for user:', userId);

    return NextResponse.json({
      ...stats,
      recentGames: recentSessions.map(s => ({
        sessionId: s.sessionId,
        difficulty: s.difficulty,
        theme: s.theme,
        moves: s.moves,
        matches: s.matches,
        score: s.score,
        completed: s.completed,
        createdAt: s.createdAt
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
