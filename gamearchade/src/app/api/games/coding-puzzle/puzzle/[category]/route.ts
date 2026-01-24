// API route for getting a random puzzle from a category
import { NextRequest, NextResponse } from 'next/server';
import { getRandomPuzzle, isValidCategory } from '@/utility/games/coding-puzzle';

// GET /api/games/coding-puzzle/puzzle/:category
// Returns a random puzzle from the specified category
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;

    // Validate category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Get random puzzle
    const puzzle = getRandomPuzzle(category);

    // Respond with puzzle
    return NextResponse.json({
      success: true,
      puzzle,
    });
  } catch (error) {
    console.error('Error getting puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to get puzzle' },
      { status: 500 }
    );
  }
}
