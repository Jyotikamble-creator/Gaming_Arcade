import { NextRequest, NextResponse } from 'next/server';
import { validateSimonMove, updateSimonGameState } from '@/lib/games/simon';
import SimonSession from '@/models/games/simon';
import type { SimonMoveRequest, SimonMoveResponse, SimonColor } from '@/types/games/simon';
import { isValidSimonColor } from '@/utility/games/simon';

/**
 * POST /api/simon/move
 * Submit a move in Simon game
 */
export async function POST(request: NextRequest) {
  try {
    const body: SimonMoveRequest = await request.json();
    const { sessionId, color, step } = body;

    // Validate input
    if (!sessionId || !color || step < 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters', success: false },
        { status: 400 }
      );
    }

    if (!isValidSimonColor(color)) {
      return NextResponse.json(
        { error: 'Invalid color specified', success: false },
        { status: 400 }
      );
    }

    // Find the game session
    const session = await SimonSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found', success: false },
        { status: 404 }
      );
    }

    if (!session.isGameActive) {
      return NextResponse.json(
        { error: 'Game session is not active', success: false },
        { status: 400 }
      );
    }

    // Validate the move
    const expectedColor = session.sequence[step] as SimonColor;
    const isCorrect = validateSimonMove(color, expectedColor, step);

    // Update session with the move
    await session.addMove(color, isCorrect);

    const response: SimonMoveResponse = {
      success: true,
      isCorrect,
      gameOver: !session.isGameActive
    };

    // If game is over, include final score
    if (!session.isGameActive) {
      response.finalScore = session.score;
      response.message = `Game over! Final score: ${session.score}`;
    } else if (step + 1 >= session.sequence.length) {
      // Level complete
      await session.completeLevel();
      response.message = `Level ${session.level - 1} complete!`;
      response.nextSequence = session.sequence;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Simon move error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process move', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}