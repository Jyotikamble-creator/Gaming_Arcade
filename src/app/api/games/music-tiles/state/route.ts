import { NextRequest, NextResponse } from 'next/server';
import { getGameSession, updateGameState, calculateStats } from '@/utility/games/music-tiles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const update = searchParams.get('update') === 'true';

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

    let { gameState, config } = session;

    // Update game state if requested
    if (update && gameState.isPlaying) {
      const updatedGameState = updateGameState(sessionId);
      if (updatedGameState) {
        gameState = updatedGameState;
      }
    }

    // Calculate current stats
    const stats = calculateStats(gameState);

    return NextResponse.json({
      success: true,
      gameState,
      config,
      stats,
    });

  } catch (error) {
    console.error('Error getting Music Tiles game state:', error);
    return NextResponse.json(
      { error: 'Failed to get game state' },
      { status: 500 }
    );
  }
}