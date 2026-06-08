import { NextRequest, NextResponse } from 'next/server';
import { useHint } from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, hintType } = body;

    if (!sessionId || !hintType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and hintType' },
        { status: 400 }
      );
    }

    const result = await useHint(sessionId, hintType);

    if (!result.session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hint: result.hint,
      session: result.session
    }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-SCRAMBLE] Error using hint:', error);
    return NextResponse.json(
      { error: 'Failed to request hint', message: error.message },
      { status: 500 }
    );
  }
}
