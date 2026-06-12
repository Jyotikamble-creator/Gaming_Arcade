import { NextRequest, NextResponse } from 'next/server';
import { generateSpeedMathBatch } from '@/lib/games/speed-math';
import type { 
  SpeedMathBatchRequest,
  SpeedMathBatchResponse,
  SpeedMathDifficulty
} from '@/types/games/speed-math';

/**
 * GET /api/speed-math/batch?difficulty=medium&count=10&operations=+,-,*
 * Generate multiple problems at once for offline play
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') as SpeedMathDifficulty) || 'medium';
    const count = parseInt(searchParams.get('count') || '10');
    const operationsParam = searchParams.get('operations');

    // Validate difficulty
    if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be easy, medium, hard, or expert.' },
        { status: 400 }
      );
    }

    // Validate count
    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 100.' },
        { status: 400 }
      );
    }

    // Parse operations if provided
    let operations = undefined;
    if (operationsParam) {
      operations = operationsParam.split(',') as any[];
      const validOps = ['+', '-', '*', '/', '^', '√'];
      if (!operations.every(op => validOps.includes(op))) {
        return NextResponse.json(
          { error: 'Invalid operations. Must be one of: +, -, *, /, ^, √' },
          { status: 400 }
        );
      }
    }

    const batchRequest: SpeedMathBatchRequest = {
      difficulty,
      count,
      operations
    };

    // Generate batch using lib function
    const batchResult: SpeedMathBatchResponse = generateSpeedMathBatch(batchRequest);

    return NextResponse.json(batchResult, { status: 200 });
  } catch (error) {
    console.error('Speed math batch generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate problems', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}