// API route for getting all puzzle categories
import { NextResponse } from 'next/server';
import { getAllCategories } from '@/utility/games/coding-puzzle';

// GET /api/games/coding-puzzle/categories
// Returns an array of all available puzzle categories
export async function GET() {
  try {
    // Get all categories with metadata
    const categories = getAllCategories();

    // Respond with categories
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}
