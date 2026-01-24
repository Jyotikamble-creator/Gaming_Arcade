// API route for validating puzzle answers
import { NextRequest, NextResponse } from 'next/server';
import { validateAnswer } from '@/lib/games/coding-puzzle';
import type { ValidateAnswerRequest } from '@/types/games/coding-puzzle';

// POST /api/games/coding-puzzle/validate
// Validates a user's answer against the correct answer
export async function POST(request: NextRequest) {
  try {
    // Extract data from request body
    const body: ValidateAnswerRequest = await request.json();
    const { answer, correctAnswer } = body;

    // Validate input
    if (!answer || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const isCorrect = validateAnswer(answer, correctAnswer);

    // Respond with result
    return NextResponse.json({
      success: true,
      isCorrect,
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    return NextResponse.json(
      { error: 'Failed to validate answer' },
      { status: 500 }
    );
  }
}
