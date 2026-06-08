import { NextRequest, NextResponse } from 'next/server';
import { createGameSession } from '@/lib/games/word-scramble';
import type { WordScrambleDifficulty, WordScrambleGameMode, WordScrambleCategory } from '@/types/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const difficulty = (body.difficulty || 'medium') as WordScrambleDifficulty;
    const gameMode = (body.gameMode || 'classic') as WordScrambleGameMode;
    const category = (body.category || 'mixed') as WordScrambleCategory;
    const userId = body.userId || undefined;
    const customWords = body.customWords || undefined;
    const customTimeLimit = body.customTimeLimit || undefined;
    const enablePowerUps = body.enablePowerUps !== false;
    const enableHints = body.enableHints !== false;
    const enableAchievements = body.enableAchievements !== false;
    const autoProgress = body.autoProgress !== false;
    const showDefinitions = body.showDefinitions !== false;
    const allowSkipping = body.allowSkipping !== false;

    const session = await createGameSession(
      {
        difficulty,
        gameMode,
        category,
        customWords,
        customTimeLimit,
        enablePowerUps,
        enableHints,
        enableAchievements,
        autoProgress,
        showDefinitions,
        allowSkipping
      },
      userId
    );

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-SCRAMBLE] Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start word-scramble game', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') || 'medium') as WordScrambleDifficulty;
    const gameMode = (searchParams.get('gameMode') || 'classic') as WordScrambleGameMode;
    const category = (searchParams.get('category') || 'mixed') as WordScrambleCategory;
    const userId = searchParams.get('userId') || undefined;

    const session = await createGameSession(
      {
        difficulty,
        gameMode,
        category,
        enablePowerUps: true,
        enableHints: true,
        enableAchievements: true,
        autoProgress: true,
        showDefinitions: true,
        allowSkipping: true
      },
      userId
    );

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-SCRAMBLE] Error starting game via GET:', error);
    return NextResponse.json(
      { error: 'Failed to start word-scramble game', message: error.message },
      { status: 500 }
    );
  }
}
