/**
 * API Route: Get Tic Tac Toe game statistics
 * GET /api/games/tic-tac-toe/stats
 */

import { NextRequest, NextResponse } from 'next/server';

interface GameStats {
  totalGames: number;
  xWins: number;
  oWins: number;
  draws: number;
  winRate: {
    X: number;
    O: number;
  };
  averageGameDuration?: number; // Could be added later with proper tracking
}

// In-memory stats (in production, use a database)
let globalStats: GameStats = {
  totalGames: 0,
  xWins: 0,
  oWins: 0,
  draws: 0,
  winRate: {
    X: 0,
    O: 0
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reset = searchParams.get('reset') === 'true';

    // Reset stats if requested (admin functionality)
    if (reset) {
      globalStats = {
        totalGames: 0,
        xWins: 0,
        oWins: 0,
        draws: 0,
        winRate: {
          X: 0,
          O: 0
        }
      };
    }

    // Calculate win rates
    const totalWins = globalStats.xWins + globalStats.oWins;
    globalStats.winRate.X = totalWins > 0 ? (globalStats.xWins / totalWins) * 100 : 0;
    globalStats.winRate.O = totalWins > 0 ? (globalStats.oWins / totalWins) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: globalStats,
      userId: userId || null
    });
  } catch (error) {
    console.error('Tic Tac Toe Stats API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winner, gameId, userId } = body;

    // Validate winner
    if (!['X', 'O', 'Draw'].includes(winner)) {
      return NextResponse.json(
        { error: 'Invalid winner. Must be X, O, or Draw' },
        { status: 400 }
      );
    }

    // Update global stats
    globalStats.totalGames += 1;

    if (winner === 'X') {
      globalStats.xWins += 1;
    } else if (winner === 'O') {
      globalStats.oWins += 1;
    } else {
      globalStats.draws += 1;
    }

    // Recalculate win rates
    const totalWins = globalStats.xWins + globalStats.oWins;
    globalStats.winRate.X = totalWins > 0 ? (globalStats.xWins / totalWins) * 100 : 0;
    globalStats.winRate.O = totalWins > 0 ? (globalStats.oWins / totalWins) * 100 : 0;

    return NextResponse.json({
      success: true,
      message: 'Game stats updated',
      stats: globalStats
    });
  } catch (error) {
    console.error('Tic Tac Toe Stats Update API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}