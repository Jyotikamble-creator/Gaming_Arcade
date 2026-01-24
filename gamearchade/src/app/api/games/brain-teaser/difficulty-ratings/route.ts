// API route for brain teaser difficulty ratings
import { NextResponse } from 'next/server';

interface DifficultyRating {
  difficulty: 'easy' | 'medium' | 'hard';
  basePoints: number;
}

interface DifficultyRatings {
  'match-shape': DifficultyRating;
  'find-odd': DifficultyRating;
  pattern: DifficultyRating;
}

// GET /api/games/brain-teaser/difficulty-ratings
// Returns predefined difficulty ratings for puzzles
export async function GET() {
  try {
    // Define difficulty ratings
    const ratings: DifficultyRatings = {
      'match-shape': { difficulty: 'easy', basePoints: 10 },
      'find-odd': { difficulty: 'medium', basePoints: 15 },
      pattern: { difficulty: 'hard', basePoints: 20 },
    };

    // Respond with ratings
    return NextResponse.json({
      success: true,
      ratings,
    });
  } catch (error) {
    console.error('Error getting difficulty ratings:', error);
    return NextResponse.json(
      { error: 'Failed to get difficulty ratings' },
      { status: 500 }
    );
  }
}
