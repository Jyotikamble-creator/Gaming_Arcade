import { NextRequest, NextResponse } from 'next/server';
import { validateSpeedMathAnswer } from '@/lib/games/speed-math';
import type { 
  SpeedMathValidationRequest,
  SpeedMathValidationResponse
} from '@/types/games/speed-math';

/**
 * POST /api/speed-math/validate
 * Validate user's answer to a math problem
 */
export async function POST(request: NextRequest) {
  try {
    const body: SpeedMathValidationRequest = await request.json();
    const { question, userAnswer, correctAnswer, timeElapsed, sessionId } = body;

    // Validate input
    if (!question || userAnswer === undefined || correctAnswer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, correctAnswer' },
        { status: 400 }
      );
    }

    // Validate answer using lib function
    const validationResult: SpeedMathValidationResponse = validateSpeedMathAnswer({
      question,
      userAnswer,
      correctAnswer,
      timeElapsed,
      sessionId
    });

    return NextResponse.json(validationResult, { status: 200 });
  } catch (error) {
    console.error('Speed math validation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate answer', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}