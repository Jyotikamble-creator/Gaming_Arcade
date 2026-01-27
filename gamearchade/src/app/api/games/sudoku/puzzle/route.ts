import { NextRequest, NextResponse } from 'next/server';
import { generateSudokuPuzzle } from '@/lib/games/sudoku';
import type { 
  SudokuPuzzleRequest,
  SudokuPuzzleResponse,
  SudokuDifficulty
} from '@/types/games/sudoku';

/**
 * GET /api/sudoku/puzzle?difficulty=easy|medium|hard|expert
 * Generate a new Sudoku puzzle
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') as SudokuDifficulty) || 'medium';
    const seedParam = searchParams.get('seed');

    // Validate difficulty
    if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Use: easy, medium, hard, or expert' },
        { status: 400 }
      );
    }

    // Parse seed if provided
    const seed = seedParam ? parseInt(seedParam) : undefined;

    const puzzleRequest: SudokuPuzzleRequest = {
      difficulty,
      seed
    };

    // Generate puzzle using lib function
    const puzzleData = generateSudokuPuzzle(puzzleRequest);

    const response: SudokuPuzzleResponse = {
      puzzle: puzzleData.puzzle,
      solution: puzzleData.solution,
      difficulty: puzzleData.difficulty,
      puzzleId: puzzleData.puzzleId,
      timestamp: puzzleData.timestamp.toISOString(),
      cellsToFill: puzzleData.cellsRemoved
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Sudoku puzzle generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate puzzle', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}