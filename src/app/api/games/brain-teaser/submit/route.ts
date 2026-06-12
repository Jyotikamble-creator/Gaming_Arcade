/**
 * API Route: Submit Brain Teaser answer
 * POST /api/games/brain-teaser/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePerformanceMetrics } from '@/lib/games/brain-teaser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puzzleId, answer, sessionId, timeSpent, hintsUsed } = body;

    if (!puzzleId || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: puzzleId, answer' },
        { status: 400 }
      );
    }

    // Mock validation (in real implementation, you'd validate against stored puzzle)
    const isCorrect = Math.random() > 0.3; // 70% correct rate for demo
    const correctAnswer = 'Option A'; // Mock correct answer
    const baseScore = isCorrect ? 15 : 0;
    const timeBonus = Math.max(0, 10 - (timeSpent || 0) / 2);
    const hintPenalty = (hintsUsed || 0) * 2;
    const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);

    console.log('[BRAIN-TEASER] Answer submitted:', {
      puzzleId,
      isCorrect,
      score: finalScore,
      sessionId
    });

    return NextResponse.json({
      isCorrect,
      correctAnswer,
      explanation: 'Mock explanation of the solution',
      score: finalScore,
      pointsEarned: baseScore,
      timeBonus,
      hintPenalty,
      feedback: isCorrect 
        ? 'Correct! Well done!' 
        : 'Incorrect. Keep trying!',
      nextPuzzle: null
    }, { status: 200 });

  } catch (error) {
    console.error('[BRAIN-TEASER] Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit brain teaser answer' },
      { status: 500 }
    );
  }
}