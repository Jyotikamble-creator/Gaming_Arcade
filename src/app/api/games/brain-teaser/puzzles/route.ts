/**
 * API Route: Generate Brain Teaser puzzles
 * GET /api/games/brain-teaser/puzzles
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePerformanceMetrics } from '@/lib/games/brain-teaser';
import type { DifficultyLevel, PuzzleType } from '@/types/games/brain-teaser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = (searchParams.get('difficulty') || 'medium') as DifficultyLevel;
    const puzzleType = (searchParams.get('type') || 'match-shape') as PuzzleType;
    const count = parseInt(searchParams.get('count') || '1');
    const userId = searchParams.get('userId') || undefined;

    // Validate parameters
    const validDifficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be: easy, medium, hard' },
        { status: 400 }
      );
    }

    const validTypes: PuzzleType[] = ['match-shape', 'find-odd', 'pattern'];
    if (!validTypes.includes(puzzleType)) {
      return NextResponse.json(
        { error: `Invalid puzzle type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Generate puzzles (mock implementation)
    const puzzles = [];
    for (let i = 0; i < count; i++) {
      const puzzle = {
        id: `puzzle_${Date.now()}_${i}`,
        type: puzzleType,
        difficulty,
        question: `Sample ${puzzleType} puzzle - ${difficulty} level`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15,
        points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
        hints: [
          { text: 'Look for patterns', cost: 5 },
          { text: 'Consider the relationships', cost: 10 }
        ]
      };
      puzzles.push(puzzle);
    }

    const sessionId = userId ? `session_${Date.now()}_${userId}` : undefined;

    console.log('[BRAIN-TEASER] Generated puzzles:', {
      count: puzzles.length,
      difficulty,
      puzzleType,
      sessionId
    });

    return NextResponse.json({
      puzzles: puzzles,
      sessionId,
      difficulty,
      puzzleType,
      totalPuzzles: puzzles.length,
      startTime: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[BRAIN-TEASER] Error generating puzzles:', error);
    return NextResponse.json(
      { error: 'Failed to generate brain teaser puzzles' },
      { status: 500 }
    );
  }
}