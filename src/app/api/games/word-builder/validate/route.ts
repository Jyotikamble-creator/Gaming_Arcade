import { NextRequest, NextResponse } from 'next/server';
import { submitWord } from '@/lib/games/word-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, word, reactionTime } = body;

    if (!sessionId || !word) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and word' },
        { status: 400 }
      );
    }

    const result = await submitWord(sessionId, word, reactionTime || 0);

    return NextResponse.json({
      success: true,
      isValid: result.isValid,
      status: result.status,
      session: result.session
    }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-BUILDER] Error validating word:', error);
    return NextResponse.json(
      { error: 'Failed to validate word', message: error.message },
      { status: 500 }
    );
  }
}
