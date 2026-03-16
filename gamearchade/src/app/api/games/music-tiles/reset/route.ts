import { NextRequest, NextResponse } from 'next/server';
import { resetGameSession } from '@/utility/games/music-tiles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Reset the game session
    const session = resetGameSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    const { gameState, config } = session;

    return NextResponse.json({
      success: true,
      gameState,
      config,
      message: 'Music Tiles game reset successfully',
    });

  } catch (error) {
    console.error('Error resetting Music Tiles game:', error);
    return NextResponse.json(
      { error: 'Failed to reset game' },
      { status: 500 }
    );
  }
}