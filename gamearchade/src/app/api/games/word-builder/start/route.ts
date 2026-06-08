import { NextRequest, NextResponse } from 'next/server';
import { selectRandomChallenge, createGameSession } from '@/lib/games/word-builder';
import type { WordBuilderDifficulty, WordBuilderGameMode } from '@/types/games/word-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const difficulty = (body.difficulty || 'easy') as WordBuilderDifficulty;
    const gameMode = (body.gameMode || 'timed') as WordBuilderGameMode;
    const userId = body.userId || undefined;
    const enablePowerUps = body.enablePowerUps !== false;
    const enableHints = body.enableHints !== false;
    const customLetters = body.customLetters || undefined;
    const customTargetWords = body.customTargetWords || undefined;
    const customTimeLimit = body.customTimeLimit || undefined;

    const challenge = selectRandomChallenge(difficulty, customLetters, customTargetWords);
    if (!challenge) {
      return NextResponse.json(
        { error: 'No challenges found for the selected difficulty' },
        { status: 400 }
      );
    }

    const session = await createGameSession(
      challenge,
      {
        difficulty,
        gameMode,
        enablePowerUps,
        enableHints,
        customTimeLimit,
        enableAchievements: true,
        autoShuffle: true,
        showProgress: true
      },
      userId
    );

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-BUILDER] Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start word-builder game', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get('difficulty') || 'easy') as WordBuilderDifficulty;
    const gameMode = (searchParams.get('gameMode') || 'timed') as WordBuilderGameMode;
    const userId = searchParams.get('userId') || undefined;

    const challenge = selectRandomChallenge(difficulty);
    if (!challenge) {
      return NextResponse.json(
        { error: 'No challenges found for the selected difficulty' },
        { status: 400 }
      );
    }

    const session = await createGameSession(
      challenge,
      {
        difficulty,
        gameMode,
        enablePowerUps: true,
        enableHints: true,
        enableAchievements: true,
        autoShuffle: true,
        showProgress: true
      },
      userId
    );

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    console.error('[WORD-BUILDER] Error starting game via GET:', error);
    return NextResponse.json(
      { error: 'Failed to start word-builder game', message: error.message },
      { status: 500 }
    );
  }
}
