import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    moves: number;
    time: number;
    target: number;
    finalSum: number;
    gridSize: number;
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

    if (!body.meta?.moves || !body.meta?.time) {
      return NextResponse.json(
        { error: 'Game statistics are required' },
        { status: 400 }
      );
    }

    // Calculate additional metrics
    const efficiency = body.meta.moves > 0 ? Math.max(0, Math.min(100, (10 / body.meta.moves) * 100)) : 0;
    const timePerMove = body.meta.moves > 0 ? Math.round(body.meta.time / body.meta.moves) : 0;

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('Number Maze Score submitted:', {
      score: body.score,
      moves: body.meta.moves,
      time: body.meta.time,
      target: body.meta.target,
      finalSum: body.meta.finalSum,
      gridSize: body.meta.gridSize,
      efficiency: Math.round(efficiency),
      timePerMove,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: 'number-maze',
        moves: body.meta.moves,
        time: body.meta.time,
        target: body.meta.target,
        efficiency: Math.round(efficiency),
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting number maze score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return top number maze scores (mock data for now)
  const mockScores = [
    { 
      id: 1, 
      player: 'MazeRunner', 
      score: 1450, 
      moves: 8, 
      time: 65, 
      target: 42, 
      efficiency: 95, 
      date: '2024-01-28' 
    },
    { 
      id: 2, 
      player: 'NumberWiz', 
      score: 1320, 
      moves: 12, 
      time: 89, 
      target: -15, 
      efficiency: 85, 
      date: '2024-01-27' 
    },
    { 
      id: 3, 
      player: 'PathFinder', 
      score: 1250, 
      moves: 15, 
      time: 120, 
      target: 78, 
      efficiency: 78, 
      date: '2024-01-26' 
    },
    { 
      id: 4, 
      player: 'SumMaster', 
      score: 1180, 
      moves: 18, 
      time: 145, 
      target: -33, 
      efficiency: 72, 
      date: '2024-01-25' 
    },
    { 
      id: 5, 
      player: 'GridExplorer', 
      score: 1120, 
      moves: 22, 
      time: 180, 
      target: 56, 
      efficiency: 65, 
      date: '2024-01-24' 
    },
  ];

  return NextResponse.json({
    success: true,
    data: mockScores
  });
}