import { NextRequest, NextResponse } from 'next/server';
import { getGameSession, calculateStats } from '@/utility/games/music-tiles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = getGameSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    const { gameState } = session;
    const stats = calculateStats(gameState);

    return NextResponse.json({
      success: true,
      stats,
      gameState: {
        score: gameState.score,
        combo: gameState.combo,
        maxCombo: gameState.maxCombo,
        hits: gameState.hits,
        misses: gameState.misses,
        perfectHits: gameState.perfectHits,
        gameStarted: gameState.gameStarted,
        gameEnded: gameState.gameEnded,
        isPlaying: gameState.isPlaying,
        difficulty: gameState.difficulty,
        timeElapsed: gameState.timeElapsed,
      },
    });

  } catch (error) {
    console.error('Error getting Music Tiles stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}