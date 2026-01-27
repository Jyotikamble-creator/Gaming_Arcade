import { NextRequest, NextResponse } from 'next/server';
import { getSimonColors, createSimonSession } from '@/lib/games/simon';
import type { SimonStartRequest, SimonStartResponse } from '@/types/games/simon';

/**
 * GET /api/simon/start
 * Starts a new Simon Says game session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const enableSound = searchParams.get('enableSound') === 'true';

    // Create Simon session
    const session = createSimonSession({ difficulty, enableSound });
    
    const response: SimonStartResponse = {
      colors: session.colors,
      seed: session.seed,
      sessionId: session.sessionId,
      config: {
        colors: session.colors,
        enableSound
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Simon start error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start Simon game', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/simon/start
 * Starts a new Simon Says game session with custom configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body: SimonStartRequest = await request.json();
    
    // Create Simon session with custom config
    const session = createSimonSession(body);
    
    const response: SimonStartResponse = {
      colors: session.colors,
      seed: session.seed,
      sessionId: session.sessionId,
      config: {
        colors: session.colors,
        enableSound: body.enableSound || false
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Simon start error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start Simon game', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}