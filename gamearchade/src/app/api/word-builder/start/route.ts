// API Route: Start Word Builder Game Session
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordBuilderGameSession } from '@/models/games/word-builder';
import { createWordBuilderSession, selectRandomChallenge } from '@/lib/games/word-builder';
import { WordBuilderGameConfig, WordBuilderDifficulty, WordBuilderGameMode } from '@/types/games/word-builder';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      difficulty = 'medium',
      gameMode = 'classic',
      customLetters,
      customTargetWords,
      customTimeLimit,
      enablePowerUps = true,
      enableHints = true,
      enableAchievements = true,
      userId
    }: Partial<WordBuilderGameConfig & { userId?: string }> = body;

    // Validate difficulty
    const validDifficulties: WordBuilderDifficulty[] = ['easy', 'medium', 'hard', 'expert', 'master'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Validate game mode
    const validGameModes: WordBuilderGameMode[] = ['classic', 'timed', 'endless', 'puzzle', 'challenge'];
    if (!validGameModes.includes(gameMode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game mode' },
        { status: 400 }
      );
    }

    // Select challenge
    const challenge = selectRandomChallenge(difficulty, customLetters, customTargetWords);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'No challenges available for this difficulty' },
        { status: 404 }
      );
    }

    // Create game session
    const gameConfig: WordBuilderGameConfig = {
      difficulty,
      gameMode,
      customLetters,
      customTargetWords,
      customTimeLimit,
      enablePowerUps,
      enableHints,
      enableAchievements,
      autoShuffle: true,
      showProgress: true
    };

    const sessionData = createWordBuilderSession(challenge, gameConfig, userId);
    
    // Save to database
    const session = new WordBuilderGameSession(sessionData);
    await session.save();

    // Prepare response (don't expose all target words)
    const responseData = {
      sessionId: session.sessionId,
      challengeId: challenge.id,
      difficulty: challenge.difficulty,
      gameMode,
      letters: challenge.letters,
      minWords: challenge.minWords,
      maxScore: challenge.maxScore,
      timeLimit: sessionData.totalDuration,
      enablePowerUps,
      enableHints,
      enableAchievements,
      category: challenge.category,
      description: challenge.description,
      hintsAvailable: sessionData.maxHints,
      startTime: sessionData.startTime,
      powerUps: sessionData.activePowerUps
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error starting Word Builder game:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to start game session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const session = await WordBuilderGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Calculate current state
    const currentTime = new Date();
    let timeRemaining = session.timeRemaining;
    
    if (!session.isPaused && session.totalDuration > 0) {
      const elapsed = currentTime.getTime() - session.startTime.getTime();
      timeRemaining = Math.max(0, session.totalDuration - elapsed / 1000);
    }

    const responseData = {
      sessionId: session.sessionId,
      challengeId: session.challengeId,
      difficulty: session.difficulty,
      gameMode: session.gameMode,
      letters: session.letters,
      foundWords: session.foundWords,
      currentScore: session.currentScore,
      wordsFound: session.wordsFound,
      targetWordsCount: session.targetWordsCount,
      timeRemaining,
      isPaused: session.isPaused,
      activePowerUps: session.activePowerUps,
      hintsUsed: session.hintsUsed,
      maxHints: session.maxHints,
      comboStreak: session.comboStreak,
      completionPercentage: session.completionPercentage,
      achievements: session.achievements
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error retrieving Word Builder session:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}