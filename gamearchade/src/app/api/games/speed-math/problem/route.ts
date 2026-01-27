import { NextRequest, NextResponse } from 'next/server';
import { generateSpeedMathProblem } from '@/lib/games/speed-math';
import type { 
  SpeedMathProblemRequest,
  SpeedMathProblemResponse,
  SpeedMathDifficulty
} from '@/types/games/speed-math';

/**
 * GET /api/speed-math/problem?difficulty=easy|medium|hard|expert
 * Generate a single math problem
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') as SpeedMathDifficulty) || 'medium';
    const operationsParam = searchParams.get('operations');
    const timeLimitParam = searchParams.get('timeLimit');

    // Validate difficulty
    if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be easy, medium, hard, or expert.' },
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

    // Parse time limit
    const timeLimit = timeLimitParam ? parseInt(timeLimitParam) : undefined;

    const problemRequest: SpeedMathProblemRequest = {
      difficulty,
      operations,
      timeLimit
    };

    // Generate problem using lib function
    const problem = generateSpeedMathProblem(problemRequest);

    const response: SpeedMathProblemResponse = {
      problem
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Speed math problem generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate problem', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}