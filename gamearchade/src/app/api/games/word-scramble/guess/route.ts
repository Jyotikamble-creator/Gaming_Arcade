import { NextRequest, NextResponse } from 'next/server';
import { submitGuess } from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, guess, reactionTime } = body;

    if (!sessionId || !guess) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and guess' },
        { status: 400 }
      );
    }

    const result = await submitGuess(sessionId, guess, reactionTime || 0);

    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      status: result.status,
      session: result.session
    }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-SCRAMBLE] Error submitting guess:', error);
    return NextResponse.json(
      { error: 'Failed to submit guess', message: error.message },
      { status: 500 }
    );
  }
}
