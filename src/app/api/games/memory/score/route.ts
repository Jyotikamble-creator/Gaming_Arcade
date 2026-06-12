import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    moves: number;
    pairs: number;
    timeElapsed: number;
    accuracy: number;
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

    if (!body.meta?.moves || !body.meta?.pairs) {
      return NextResponse.json(
        { error: 'Game statistics are required' },
        { status: 400 }
      );
    }

    // Calculate performance metrics
    const perfectMoves = body.meta.pairs;
    const efficiency = Math.round((perfectMoves / body.meta.moves) * 100);
    const timePerPair = Math.round(body.meta.timeElapsed / body.meta.pairs);

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('Memory Card Score submitted:', {
      score: body.score,
      moves: body.meta.moves,
      pairs: body.meta.pairs,
      timeElapsed: body.meta.timeElapsed,
      accuracy: body.meta.accuracy,
      efficiency: `${efficiency}%`,
      timePerPair: `${timePerPair}s`,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: 'memory-card',
        moves: body.meta.moves,
        pairs: body.meta.pairs,
        timeElapsed: body.meta.timeElapsed,
        efficiency,
        accuracy: body.meta.accuracy,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting memory card score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return top memory card scores (mock data for now)
  const mockScores = [
    { 
      id: 1, 
      player: 'MemoryMaster', 
      score: 1450, 
      moves: 8, 
      pairs: 8, 
      time: 45, 
      efficiency: 100, 
      date: '2024-01-28' 
    },
    { 
      id: 2, 
      player: 'CardSharp', 
      score: 1320, 
      moves: 10, 
      pairs: 8, 
      time: 52, 
      efficiency: 80, 
      date: '2024-01-27' 
    },
    { 
      id: 3, 
      player: 'QuickMatch', 
      score: 1250, 
      moves: 12, 
      pairs: 8, 
      time: 48, 
      efficiency: 67, 
      date: '2024-01-26' 
    },
    { 
      id: 4, 
      player: 'BrainGamer', 
      score: 1180, 
      moves: 14, 
      pairs: 8, 
      time: 65, 
      efficiency: 57, 
      date: '2024-01-25' 
    },
    { 
      id: 5, 
      player: 'FlipExpert', 
      score: 1120, 
      moves: 16, 
      pairs: 8, 
      time: 72, 
      efficiency: 50, 
      date: '2024-01-24' 
    },
  ];

  return NextResponse.json({
    success: true,
    data: mockScores
  });
}