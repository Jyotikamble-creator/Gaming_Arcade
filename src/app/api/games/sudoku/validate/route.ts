import { NextRequest, NextResponse } from 'next/server';
import { validateSudokuBoard } from '@/lib/games/sudoku';
import type { 
  SudokuValidationRequest,
  SudokuValidationResponse
} from '@/types/games/sudoku';

/**
 * POST /api/sudoku/validate
 * Validate a Sudoku board solution
 */
export async function POST(request: NextRequest) {
  try {
    const body: SudokuValidationRequest = await request.json();
    const { board, solution, puzzleId } = body;

    // Validate input
    if (!board) {
      return NextResponse.json(
        { error: 'Board is required' },
        { status: 400 }
      );
    }

    // Validate board format
    if (!Array.isArray(board) || board.length !== 9 || 
        !board.every(row => Array.isArray(row) && row.length === 9)) {
      return NextResponse.json(
        { error: 'Board must be a 9x9 array' },
        { status: 400 }
      );
    }

    // Validate that all values are numbers 0-9
    const isValidBoard = board.every(row => 
      row.every(cell => typeof cell === 'number' && cell >= 0 && cell <= 9)
    );

    if (!isValidBoard) {
      return NextResponse.json(
        { error: 'Board must contain only numbers 0-9' },
        { status: 400 }
      );
    }

    // Validate board using lib function
    const validationResult: SudokuValidationResponse = validateSudokuBoard({
      board,
      solution,
      puzzleId
    });

    return NextResponse.json(validationResult, { status: 200 });
  } catch (error) {
    console.error('Sudoku validation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate solution', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}