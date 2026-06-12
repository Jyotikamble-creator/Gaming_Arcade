import { NextRequest, NextResponse } from 'next/server';
import { createGameSession } from '@/utility/games/music-tiles';
import { MusicTilesDifficulty } from '@/types/games/music-tiles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty } = body;

    // Validate difficulty
    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be easy, medium, or hard.' },
        { status: 400 }
      );
    }

    // Create new game session
    const { sessionId, gameState, config } = createGameSession(difficulty as MusicTilesDifficulty);

    return NextResponse.json({
      success: true,
      sessionId,
      gameState,
      config,
      message: 'Music Tiles game started successfully',
    });

  } catch (error) {
    console.error('Error starting Music Tiles game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}