import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    attempts: number;
    hintsUsed: number;
    puzzleId: string;
    streak: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreSubmission = await request.json();
    
    // Validate the request body
    if (!body.score || typeof body.score !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score provided' },
        { status: 400 }
      );
    }

    if (typeof body.meta?.attempts !== 'number' || typeof body.meta?.hintsUsed !== 'number') {
      return NextResponse.json(
        { error: 'Game statistics are required' },
        { status: 400 }
      );
    }

    // Calculate performance metrics
    const efficiency = Math.round((1 / body.meta.attempts) * 100);

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('Emoji Guess Score submitted:', {
      score: body.score,
      attempts: body.meta.attempts,
      hintsUsed: body.meta.hintsUsed,
      puzzleId: body.meta.puzzleId,
      streak: body.meta.streak,
      efficiency: `${efficiency}%`,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: 'emoji-guess',
        attempts: body.meta.attempts,
        hintsUsed: body.meta.hintsUsed,
        streak: body.meta.streak,
        efficiency,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting emoji guess score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
