/**
 * API Route: Submit Sudoku solution
 * POST /api/games/sudoku/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSudokuBoard } from '@/lib/games/sudoku';
import type { ISudokuSubmissionRequest } from '@/types/games/sudoku';

export async function POST(request: NextRequest) {
  try {
    const body: SudokuSubmissionRequest = await request.json();
    const { puzzle, solution, startTime, endTime, hintsUsed, difficulty } = body;

    // Validate required fields
    if (!puzzle || !solution || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: puzzle, solution, startTime' },
        { status: 400 }
      );
    }

    // Validate the solution
    const validationResult = validateSudokuBoard({ board: solution, solution: puzzle });

    if (!validationResult.valid) {
      return NextResponse.json({
        isCorrect: false,
        errors: validationResult.errors,
        score: 0,
        message: 'Puzzle solution is incorrect'
      }, { status: 200 });
    }

    // Calculate completion time
    const completionTime = endTime 
      ? new Date(endTime).getTime() - new Date(startTime).getTime()
      : 0;

    // Calculate score (mock implementation)
    const baseScore = 1000;
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    const timeBonus = Math.max(0, 300000 - completionTime); // 5 minute max
    const hintPenalty = (hintsUsed || 0) * 50;
    const score = Math.round((baseScore * difficultyMultiplier + timeBonus / 1000) - hintPenalty);

    console.log('[SUDOKU] Solution submitted:', {
      isCorrect: true,
      completionTime,
      score,
      hintsUsed,
      difficulty
    });

    return NextResponse.json({
      isCorrect: true,
      score,
      completionTime,
      hintsUsed: hintsUsed || 0,
      difficulty: difficulty || 'medium',
      rating: score > 800 ? 'Excellent' : score > 600 ? 'Good' : score > 400 ? 'Fair' : 'Needs Improvement',
      message: 'Congratulations! Puzzle solved correctly.'
    }, { status: 200 });

  } catch (error) {
    console.error('[SUDOKU] Error submitting solution:', error);
    return NextResponse.json(
      { error: 'Failed to submit Sudoku solution' },
      { status: 500 }
    );
  }
}