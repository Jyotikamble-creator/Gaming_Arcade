import { NextRequest, NextResponse } from 'next/server';
import { handleLanePress, calculateStats } from '@/utility/games/music-tiles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, lane } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (typeof lane !== 'number' || lane < 0 || lane > 4) {
      return NextResponse.json(
        { error: 'Invalid lane number. Must be between 0 and 4.' },
        { status: 400 }
      );
    }

    // Handle the lane press
    const gameState = handleLanePress(sessionId, lane);
    if (!gameState) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    // Calculate updated stats
    const stats = calculateStats(gameState);

    return NextResponse.json({
      success: true,
      gameState,
      stats,
      message: 'Lane press processed successfully',
    });

  } catch (error) {
    console.error('Error processing Music Tiles move:', error);
    return NextResponse.json(
      { error: 'Failed to process move' },
      { status: 500 }
    );
  }
}