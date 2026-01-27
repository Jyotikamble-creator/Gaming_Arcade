/**
 * API Route: Generate Sudoku puzzle
 * GET /api/games/sudoku/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSudokuPuzzle } from '@/lib/games/sudoku';
import type { SudokuDifficulty, ISudokuPuzzle } from '@/types/games/sudoku';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') || 'medium') as SudokuDifficulty;
    const userId = searchParams.get('userId') || undefined;

    // Validate difficulty
    const validDifficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be: easy, medium, hard, expert' },
        { status: 400 }
      );
    }

    // Generate puzzle
    const puzzle: ISudokuPuzzle = generateSudokuPuzzle({ difficulty });

    console.log('[SUDOKU] Generated puzzle:', {
      difficulty,
      filledCells: puzzle.puzzle.flat().filter((cell: number) => cell !== 0).length,
      puzzleId: puzzle.puzzleId
    });

    return NextResponse.json({
      puzzle: puzzle.puzzle,
      solution: puzzle.solution,
      difficulty,
      id: puzzle.puzzleId,
      startTime: new Date().toISOString(),
      hints: 3,
      originalFilledCells: puzzle.puzzle.flat().filter((cell: number) => cell !== 0).length
    }, { status: 200 });

  } catch (error) {
    console.error('[SUDOKU] Error generating puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to generate Sudoku puzzle' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/sudoku/generate
 * Generate puzzle with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty = 'medium', customConstraints } = body;

    // Generate puzzle with custom parameters
    const puzzle: ISudokuPuzzle = generateSudokuPuzzle({ difficulty });

    return NextResponse.json({
      puzzle: puzzle.puzzle,
      solution: puzzle.solution,
      difficulty,
      id: puzzle.puzzleId,
      startTime: new Date().toISOString(),
      hints: 3,
      constraints: customConstraints
    }, { status: 200 });

  } catch (error) {
    console.error('[SUDOKU] Error generating custom puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to generate custom Sudoku puzzle' },
      { status: 500 }
    );
  }
}