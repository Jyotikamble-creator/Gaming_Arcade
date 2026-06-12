// API route for calculating brain teaser performance metrics
import { NextRequest, NextResponse } from 'next/server';

interface PerformanceRequest {
  score: number;
  puzzlesSolved: number;
  bestStreak: number;
  timeUsed: number;
}

interface PerformanceMetrics {
  avgPointsPerPuzzle: number;
  puzzlesPerSecond: string;
  performanceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'genius';
  streakBonus: number;
}

type PerformanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'genius';

// POST /api/games/brain-teaser/calculate-performance
// Returns performance metrics based on score, puzzles solved, and time used
export async function POST(request: NextRequest) {
  try {
    // Extract data from request body
    const body: PerformanceRequest = await request.json();
    const { score, puzzlesSolved, bestStreak, timeUsed } = body;

    // Validate input
    if (!score || !puzzlesSolved || !timeUsed) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate metrics
    const avgPointsPerPuzzle = Math.round(score / puzzlesSolved);
    const puzzlesPerSecond = (puzzlesSolved / timeUsed).toFixed(2);

    // Determine performance level
    // Levels: beginner, intermediate, advanced, expert, genius
    let performanceLevel: PerformanceLevel = 'beginner';
    if (puzzlesSolved >= 20) performanceLevel = 'genius';
    else if (puzzlesSolved >= 15) performanceLevel = 'expert';
    else if (puzzlesSolved >= 10) performanceLevel = 'advanced';
    else if (puzzlesSolved >= 5) performanceLevel = 'intermediate';

    // Calculate streak bonus
    const streakBonus = bestStreak >= 5 ? (bestStreak - 4) * 10 : 0;

    // Respond with calculated metrics
    const metrics: PerformanceMetrics = {
      avgPointsPerPuzzle,
      puzzlesPerSecond,
      performanceLevel,
      streakBonus,
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error calculating performance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate performance' },
      { status: 500 }
    );
  }
}
