import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let response: any = {};
    response.leaderboard = [];
    response.globalStats = {
      totalGames: 0,
      averageScore: 0,
      highestScore: 0,
      totalPlayers: 0
    };

    if (userId) {
      response.userStats = null;
      response.recentGames = [];
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Game stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get statistics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
