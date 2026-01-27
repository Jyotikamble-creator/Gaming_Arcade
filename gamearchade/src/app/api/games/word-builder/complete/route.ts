// API Route: Complete Word Builder Game Session
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordBuilderGameSession } from '@/models/games/word-builder';
import { 
  calculateFinalPerformanceMetrics,
  determineGameRating,
  generateGameSummary
} from '@/lib/games/word-builder';

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

    const currentTime = new Date();
    
    // Check if session should be completed
    let shouldComplete = forceComplete;
    
    if (!shouldComplete && session.totalDuration > 0) {
      const elapsed = (currentTime.getTime() - session.startTime.getTime()) / 1000;
      shouldComplete = elapsed >= session.totalDuration;
    }

    if (!shouldComplete) {
      // Check if minimum words requirement is met (for early completion)
      const targetWords = session.targetWordsCount;
      const foundWords = session.wordsFound;
      const completionRate = targetWords > 0 ? foundWords / targetWords : 0;
      
      if (completionRate >= 0.8) { // Allow completion at 80% or higher
        shouldComplete = true;
      }
    }

    if (!shouldComplete) {
      return NextResponse.json(
        { success: false, error: 'Game cannot be completed yet' },
        { status: 400 }
      );
    }

    // Calculate final metrics
    session.endTime = currentTime;
    session.isCompleted = true;
    
    const totalPlayTime = (session.endTime.getTime() - session.startTime.getTime()) / 1000;
    
    // Update final performance metrics
    const performanceMetrics = calculateFinalPerformanceMetrics(session, totalPlayTime);
    
    // Update session with calculated metrics
    session.averageWordTime = performanceMetrics.averageWordTime;
    session.wordsPerMinute = performanceMetrics.totalAttempts > 0 ? 
      (session.wordsFound / (totalPlayTime / 60)) : 0;
    session.accuracy = performanceMetrics.accuracy;
    session.consistencyRating = performanceMetrics.consistencyScore;
    
    // Determine final rating
    const gameRating = determineGameRating(performanceMetrics);
    session.finalRating = gameRating;
    
    // Calculate completion percentage
    const targetWords = session.targetWordsCount;
    session.completionPercentage = targetWords > 0 ? 
      Math.round((session.wordsFound / targetWords) * 100) : 100;
    
    // Generate achievement summary
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
    
    if (session.maxComboStreak >= 5 && !finalAchievements.includes('combo_master')) {
      finalAchievements.push('combo_master');
    }
    
    session.achievements = finalAchievements;
    
    // Save completed session
    await session.save();
    
    // Generate game summary
    const gameSummary = generateGameSummary(session, performanceMetrics);
    
    const response = {
      sessionId: session.sessionId,
      challengeId: session.challengeId,
      difficulty: session.difficulty,
      gameMode: session.gameMode,
      
      // Final Results
      finalScore: session.currentScore,
      wordsFound: session.wordsFound,
      targetWordsCount: session.targetWordsCount,
      completionPercentage: session.completionPercentage,
      totalPlayTime: Math.round(totalPlayTime),
      
      // Performance Metrics
      accuracy: Math.round(session.accuracy * 100),
      averageWordTime: Math.round(session.averageWordTime * 10) / 10,
      wordsPerMinute: Math.round(session.wordsPerMinute * 10) / 10,
      longestWord: session.longestWord,
      shortestWord: session.shortestWord,
      maxComboStreak: session.maxComboStreak,
      
      // Advanced Stats
      letterUsageStats: Object.fromEntries(session.letterUsageStats),
      wordLengthDistribution: Object.fromEntries(session.wordLengthDistribution),
      hintsUsed: session.hintsUsed,
      
      // Rating and Achievements
      finalRating: session.finalRating,
      achievements: session.achievements,
      newAchievements: finalAchievements.slice(-3), // Last 3 achievements
      
      // Detailed Performance
      performanceBreakdown: {
        speedRating: performanceMetrics.speedRating,
        accuracyRating: performanceMetrics.accuracyRating,
        discoveryRating: performanceMetrics.discoveryRating,
        consistencyRating: performanceMetrics.consistencyRating,
        overallRating: performanceMetrics.overallRating
      },
      
      // Game Summary
      summary: gameSummary,
      
      // Words Found
      foundWordsList: session.foundWords,
      
      // Completion timestamp
      completedAt: session.endTime
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error completing Word Builder game:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to complete game session' },
      { status: 500 }
    );
  }
}