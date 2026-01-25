// API Route: Complete Word Scramble Game Session
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordScrambleGameSession } from '@/models/games/word-scramble';
import { 
  calculateFinalPerformanceMetrics,
  determineGameRating,
  generateGameSummary
} from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { sessionId, forceComplete = false } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Find active session
    const session = await WordScrambleGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    const currentTime = new Date();
    
    // Check if session should be completed
    let shouldComplete = forceComplete;
    
    if (!shouldComplete && session.totalDuration > 0) {
      const elapsed = (currentTime.getTime() - session.startTime.getTime()) / 1000;
      shouldComplete = elapsed >= session.totalDuration;
    }

    if (!shouldComplete) {
      // Check if all words are completed
      shouldComplete = session.wordsCompleted >= session.totalWords;
    }

    if (!shouldComplete) {
      return NextResponse.json(
        { success: false, error: 'Game cannot be completed yet' },
        { status: 400 }
      );
    }

    // Complete the session
    session.endTime = currentTime;
    session.isCompleted = true;
    
    const totalPlayTime = (session.endTime.getTime() - session.startTime.getTime()) / 1000;
    
    // Calculate final performance metrics
    const performanceMetrics = calculateFinalPerformanceMetrics(session, totalPlayTime);
    
    // Update session with calculated metrics
    session.averageReactionTime = performanceMetrics.averageReactionTime;
    session.accuracy = performanceMetrics.accuracy;
    session.consistencyScore = performanceMetrics.consistencyRating;
    
    // Determine final rating
    const gameRating = determineGameRating(performanceMetrics);
    session.finalRating = gameRating;
    
    // Calculate completion percentage
    session.completionPercentage = Math.round((session.wordsCompleted / session.totalWords) * 100);
    
    // Generate final achievements
    const finalAchievements = [...session.achievements];
    
    // Check for completion-based achievements
    if (session.completionPercentage >= 100) {
      if (!finalAchievements.includes('perfect_completion')) {
        finalAchievements.push('perfect_completion');
      }
    }
    
    if (session.accuracy >= 0.9 && !finalAchievements.includes('high_accuracy')) {
      finalAchievements.push('high_accuracy');
    }
    
    if (session.maxStreak >= 10 && !finalAchievements.includes('streak_master')) {
      finalAchievements.push('streak_master');
    }
    
    if (session.perfectWords >= 5 && !finalAchievements.includes('first_try_master')) {
      finalAchievements.push('first_try_master');
    }
    
    session.achievements = finalAchievements;
    
    // Save completed session
    await session.save();
    
    // Generate game summary
    const gameSummary = generateGameSummary(session, performanceMetrics);
    
    const response = {
      sessionId: session.sessionId,
      difficulty: session.difficulty,
      gameMode: session.gameMode,
      category: session.category,
      
      // Final Results
      finalScore: session.currentScore,
      wordsCompleted: session.wordsCompleted,
      totalWords: session.totalWords,
      wordsSkipped: session.skippedWords.length,
      completionPercentage: session.completionPercentage,
      totalPlayTime: Math.round(totalPlayTime),
      
      // Performance Metrics
      accuracy: Math.round(session.accuracy * 100),
      totalGuesses: session.totalGuesses,
      correctGuesses: session.correctGuesses,
      averageReactionTime: Math.round(session.averageReactionTime),
      fastestSolve: session.fastestSolve,
      slowestSolve: session.slowestSolve,
      
      // Streaks and Special Achievements
      maxStreak: session.maxStreak,
      perfectWords: session.perfectWords,
      oneGuessWords: session.oneGuessWords,
      
      // Hints and Power-ups
      totalHintsUsed: session.totalHintsUsed,
      maxHints: session.maxHints,
      
      // Category Performance
      categoryStats: Object.fromEntries(session.categoryStats),
      
      // Rating and Achievements
      finalRating: session.finalRating,
      achievements: session.achievements,
      newAchievements: finalAchievements.slice(-3), // Last 3 achievements
      
      // Detailed Performance Breakdown
      performanceBreakdown: {
        speedRating: performanceMetrics.speedRating,
        accuracyRating: performanceMetrics.accuracyRating,
        streakRating: performanceMetrics.streakRating,
        difficultyRating: performanceMetrics.difficultyRating,
        overallRating: performanceMetrics.overallRating
      },
      
      // Words Details
      completedWordsList: session.completedWords.map(word => ({
        original: word.original,
        scrambled: word.scrambled,
        category: word.category,
        difficulty: word.difficulty,
        points: word.points
      })),
      skippedWordsList: session.skippedWords,
      
      // Game Summary
      summary: gameSummary,
      
      // Completion timestamp
      completedAt: session.endTime
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error completing Word Scramble game:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to complete game session' },
      { status: 500 }
    );
  }
}