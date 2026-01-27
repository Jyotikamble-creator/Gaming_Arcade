/**
 * API Route: Start a new Sliding Puzzle game
 * GET /api/games/sliding-puzzle/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSlidingPuzzleSession, getSlidingPuzzleBenchmarks } from '@/lib/games/sliding-puzzle';
import { generateUniqueId } from '@/utility/games/sliding-puzzle';
import type { SlidingPuzzleDifficulty, ISlidingPuzzleConfig } from '@/types/games/sliding-puzzle';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = (searchParams.get('difficulty') || 'intermediate') as SlidingPuzzleDifficulty;
    const userId = searchParams.get('userId') || undefined;
    const puzzleSize = parseInt(searchParams.get('size') || '4');

    // Validate difficulty
    const validDifficulties: SlidingPuzzleDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Create puzzle config
    const config: ISlidingPuzzleConfig = {
      size: puzzleSize,
      difficulty,
      enableHints: true,
      enableTimer: true,
      shuffleMoves: 100
    };

    // Create game session
    const session = createSlidingPuzzleSession(config, userId);

    // Generate initial scrambled state
    const initialState = Array.from({ length: puzzleSize * puzzleSize }, (_, i) => 
      i === puzzleSize * puzzleSize - 1 ? 0 : i + 1
    );
    
    // Scramble the puzzle
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = initialState.indexOf(0);
      const possibleMoves = [];
      
      if (emptyIndex % puzzleSize !== 0) possibleMoves.push(emptyIndex - 1); // left
      if (emptyIndex % puzzleSize !== puzzleSize - 1) possibleMoves.push(emptyIndex + 1); // right
      if (emptyIndex >= puzzleSize) possibleMoves.push(emptyIndex - puzzleSize); // up
      if (emptyIndex < puzzleSize * (puzzleSize - 1)) possibleMoves.push(emptyIndex + puzzleSize); // down
      
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [initialState[emptyIndex], initialState[randomMove]] = [initialState[randomMove], initialState[emptyIndex]];
    }

    console.log('[SLIDING-PUZZLE] New puzzle started:', {
      sessionId: session.sessionId,
      difficulty,
      puzzleSize,
      userId
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      puzzle: {
        id: session.sessionId,
        gridSize: puzzleSize,
        pieces: initialState,
        emptyPosition: initialState.indexOf(0)
      },
      difficulty,
      startTime: session.startTime,
      moveCount: 0,
      isCompleted: false
    }, { status: 200 });

  } catch (error) {
    console.error('[SLIDING-PUZZLE] Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start sliding puzzle game' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/sliding-puzzle/start
 * Start a new game with custom configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty = 'intermediate', size = 4, userId } = body;

    // Create puzzle config
    const config: ISlidingPuzzleConfig = {
      size,
      difficulty,
      enableHints: true,
      enableTimer: true,
      shuffleMoves: 100
    };

    // Create game session
    const session = createSlidingPuzzleSession(config, userId);

    return NextResponse.json({
      sessionId: session.sessionId,
      puzzle: {
        id: session.sessionId,
        gridSize: size,
        pieces: session.initialState,
        emptyPosition: session.initialState.indexOf(0)
      },
      difficulty,
      startTime: session.startTime,
      moveCount: 0,
      isCompleted: false
    }, { status: 201 });

  } catch (error) {
    console.error('[SLIDING-PUZZLE] Error starting custom game:', error);
    return NextResponse.json(
      { error: 'Failed to start custom sliding puzzle game' },
      { status: 500 }
    );
  }
}