// API route for getting leaderboard
import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/common/score';

// GET /api/common/leaderboard?game=word-guess&limit=10
// Get leaderboard for a specific game
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const game = searchParams.get('game') || 'word-guess';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { ok: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get leaderboard
    const leaderboard = await getLeaderboard(game, limit);

    // Respond with leaderboard
    return NextResponse.json({
      ok: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
