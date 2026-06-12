/**
 * API Route: Generate Coding Puzzle
 * GET /api/games/coding-puzzle/puzzle
 */

import { NextRequest, NextResponse } from 'next/server';
import type { DifficultyLevel, PuzzleCategory } from '@/types/games/coding-puzzle';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = (searchParams.get('difficulty') || 'medium') as DifficultyLevel;
    const category = (searchParams.get('category') || 'patterns') as PuzzleCategory;
    const language = searchParams.get('language') || 'javascript';
    const userId = searchParams.get('userId') || undefined;

    // Validate parameters
    const validDifficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be: easy, medium, hard' },
        { status: 400 }
      );
    }

    const validCategories: PuzzleCategory[] = ['patterns', 'codeOutput', 'logic', 'bitwise'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate mock puzzle
    const puzzle = {
      id: `puzzle_${Date.now()}`,
      title: `${category} Challenge - ${difficulty}`,
      description: `Solve this ${difficulty} level ${category} programming puzzle`,
      difficulty,
      category,
      language,
      constraints: [`Time limit: ${difficulty === 'easy' ? 300 : difficulty === 'medium' ? 200 : 120} seconds`],
      examples: [
        {
          input: 'Example input',
          output: 'Expected output',
          explanation: 'How to get from input to output'
        }
      ],
      testCases: [
        { input: 'test1', expectedOutput: 'result1' },
        { input: 'test2', expectedOutput: 'result2' }
      ],
      timeLimit: difficulty === 'easy' ? 300 : difficulty === 'medium' ? 200 : 120,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
      hints: [
        { text: 'Think about the pattern', cost: 5 },
        { text: 'Consider edge cases', cost: 10 }
      ]
    };

    const sessionId = userId ? `session_${Date.now()}_${userId}` : undefined;

    console.log('[CODING-PUZZLE] Generated puzzle:', {
      id: puzzle.id,
      difficulty,
      category,
      language,
      sessionId
    });

    return NextResponse.json({
      puzzle: puzzle,
      sessionId,
      startTime: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[CODING-PUZZLE] Error generating puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to generate coding puzzle' },
      { status: 500 }
    );
  }
}