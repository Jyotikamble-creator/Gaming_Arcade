/**
 * API Route: Submit Coding Puzzle solution
 * POST /api/games/coding-puzzle/submit
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puzzleId, solution, sessionId, timeSpent, hintsUsed, language } = body;

    if (!puzzleId || !solution) {
      return NextResponse.json(
        { error: 'Missing required fields: puzzleId, solution' },
        { status: 400 }
      );
    }

    // Validate the solution format
    if (typeof solution !== 'string' || solution.trim().length === 0) {
      return NextResponse.json(
        { error: 'Solution must be a non-empty string' },
        { status: 400 }
      );
    }

    // Mock test case execution (in real implementation, you'd execute code securely)
    const totalTests = 5;
    const passedTests = Math.floor(Math.random() * totalTests) + 1; // Random pass rate for demo
    const isCorrect = passedTests === totalTests;
    
    // Mock scoring calculation
    const baseScore = passedTests * 10;
    const timeBonus = Math.max(0, 50 - (timeSpent || 0) / 10);
    const hintPenalty = (hintsUsed || 0) * 5;
    const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);

    // Mock code quality assessment
    const codeQuality = Math.floor(Math.random() * 100) + 1;

    console.log('[CODING-PUZZLE] Solution submitted:', {
      puzzleId,
      testsPassed: passedTests,
      totalTests,
      score: finalScore,
      sessionId
    });

    return NextResponse.json({
      isCorrect,
      testResults: {
        passed: passedTests,
        total: totalTests,
        results: Array.from({ length: totalTests }, (_, i) => ({
          testCase: i + 1,
          passed: i < passedTests,
          output: `Test ${i + 1} output`,
          expected: `Expected ${i + 1}`,
          error: i >= passedTests ? 'Test failed' : null
        })),
        output: 'Mock execution output',
        errors: passedTests < totalTests ? ['Some tests failed'] : []
      },
      score: finalScore,
      pointsEarned: baseScore,
      timeBonus,
      hintPenalty,
      codeQuality,
      feedback: isCorrect 
        ? 'Excellent! All test cases passed!' 
        : `${passedTests}/${totalTests} test cases passed. Keep improving!`,
      optimizationTips: [
        'Consider using more efficient algorithms',
        'Look for edge cases in your solution'
      ]
    }, { status: 200 });

  } catch (error) {
    console.error('[CODING-PUZZLE] Error submitting solution:', error);
    return NextResponse.json(
      { error: 'Failed to submit coding puzzle solution' },
      { status: 500 }
    );
  }
}