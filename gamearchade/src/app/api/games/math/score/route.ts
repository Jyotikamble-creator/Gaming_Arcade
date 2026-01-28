import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    questionsAnswered: number;
    correctAnswers?: number;
    skippedQuestions?: number;
    timeSpent?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreSubmission = await request.json();
    
    // Validate the request body
    if (!body.score || typeof body.score !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score provided' },
        { status: 400 }
      );
    }

    if (!body.meta?.questionsAnswered) {
      return NextResponse.json(
        { error: 'Questions answered count is required' },
        { status: 400 }
      );
    }

    // Calculate accuracy
    const correctAnswers = body.meta.correctAnswers || Math.floor(body.score / 10);
    const accuracy = body.meta.questionsAnswered > 0 
      ? Math.round((correctAnswers / body.meta.questionsAnswered) * 100)
      : 0;

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('Math Quiz Score submitted:', {
      score: body.score,
      questionsAnswered: body.meta.questionsAnswered,
      correctAnswers,
      accuracy: `${accuracy}%`,
      skippedQuestions: body.meta.skippedQuestions || 0,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: 'math-quiz',
        questionsAnswered: body.meta.questionsAnswered,
        correctAnswers,
        accuracy,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting math quiz score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return top math quiz scores (mock data for now)
  const mockScores = [
    { id: 1, player: 'MathWizard', score: 100, accuracy: 100, questionsAnswered: 10, date: '2024-01-28' },
    { id: 2, player: 'NumberCruncher', score: 90, accuracy: 90, questionsAnswered: 10, date: '2024-01-27' },
    { id: 3, player: 'QuickCalc', score: 85, accuracy: 85, questionsAnswered: 10, date: '2024-01-26' },
    { id: 4, player: 'MathPro', score: 80, accuracy: 89, questionsAnswered: 9, date: '2024-01-25' },
    { id: 5, player: 'AlgebraAce', score: 75, accuracy: 83, questionsAnswered: 9, date: '2024-01-24' },
  ];

  return NextResponse.json({
    success: true,
    data: mockScores
  });
}