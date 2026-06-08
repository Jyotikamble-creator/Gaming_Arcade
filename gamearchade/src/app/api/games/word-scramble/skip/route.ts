import { NextRequest, NextResponse } from 'next/server';
import { skipWord } from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    const session = await skipWord(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-SCRAMBLE] Error skipping word:', error);
    return NextResponse.json(
      { error: 'Failed to skip word', message: error.message },
      { status: 500 }
    );
  }
}
