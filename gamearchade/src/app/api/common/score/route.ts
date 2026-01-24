// API route for posting a new score
import { NextRequest, NextResponse } from 'next/server';
import { createScore, validateScoreData } from '@/lib/common/score';
import type { CreateScoreRequest } from '@/types/common/score';

// POST /api/common/score
// Create a new score entry
export async function POST(request: NextRequest) {
  try {
    // Extract data from request body
    const body: CreateScoreRequest = await request.json();
    const { game, player = 'guest', score = 0, meta = {} } = body;

    // Validate input
    const validation = validateScoreData(game, score, player);
    if (!validation.valid) {
      return NextResponse.json(
        { ok: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Create score
    const newScore = await createScore(game, score, player, meta);

    // Respond with created score
    return NextResponse.json({
      ok: true,
      score: newScore,
    });
  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
