/**
 * API Route: Start a new Number Maze game
 * GET /api/games/number-maze/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNumbers, DIFFICULTY_BENCHMARKS } from '@/utility/games/number-maze';
import { createMazeSession } from '@/lib/games/number-maze';
import type { NumberMazeDifficultyLevel } from '@/types/games/number-maze';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = (searchParams.get('difficulty') || 'beginner') as NumberMazeDifficultyLevel;
    const userId = searchParams.get('userId') || undefined;
    const customStart = searchParams.get('customStart');
    const customTarget = searchParams.get('customTarget');

    // Generate or use custom numbers
    let startNumber: number;
    let targetNumber: number;

    if (customStart && customTarget) {
      startNumber = parseInt(customStart);
      targetNumber = parseInt(customTarget);
      
      if (isNaN(startNumber) || isNaN(targetNumber)) {
        return NextResponse.json(
          { error: 'Invalid custom numbers provided' },
          { status: 400 }
        );
      }
    } else {
      const numbers = generateNumbers(difficulty);
      startNumber = numbers.startNumber;
      targetNumber = numbers.targetNumber;
    }

    // Create maze session
    const session = await createMazeSession(startNumber, targetNumber, difficulty, userId);

    // Get benchmark for this difficulty
    const benchmark = DIFFICULTY_BENCHMARKS[difficulty];

    console.log('[NUMBER-MAZE] New maze started:', {
      sessionId: session.sessionId,
      startNumber,
      targetNumber,
      difficulty
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      startNumber,
      targetNumber,
      currentNumber: startNumber,
      difficulty,
      benchmark,
      startTime: session.startTime
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error starting maze:', error);
    return NextResponse.json(
      { error: 'Failed to start number maze' },
      { status: 500 }
    );
  }
}
