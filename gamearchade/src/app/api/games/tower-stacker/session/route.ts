import { NextRequest, NextResponse } from "next/server";
import { 
  TowerStackerGameSession, 
  TowerStackerAPIResponse,
  TowerStackerSessionRequest 
} from "@/types/games/tower-stacker";
import { TowerStackerSession } from "@/models/games/tower-stacker";
import { createTowerStackerSession } from "@/lib/games/tower-stacker";

// POST /api/tower-stacker/session - Create a new game session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TowerStackerSessionRequest = await request.json();
    const { userId, difficulty = 'beginner', configuration } = body;

    if (!userId) {
      const response: TowerStackerAPIResponse = {
        success: false,
        error: "User ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create new game session
    const gameSession = await createTowerStackerSession({
      userId,
      difficulty,
      configuration
    });

    const response: TowerStackerAPIResponse<TowerStackerGameSession> = {
      success: true,
      data: gameSession,
      message: "Game session created successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating tower stacker session:", error);
    
    const response: TowerStackerAPIResponse = {
      success: false,
      error: "Failed to create game session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/tower-stacker/session?sessionId=xxx - Get session details
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const response: TowerStackerAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const session = await TowerStackerSession.findById(sessionId);

    if (!session) {
      const response: TowerStackerAPIResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: TowerStackerAPIResponse<TowerStackerGameSession> = {
      success: true,
      data: session.toObject(),
      message: "Session retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving tower stacker session:", error);
    
    const response: TowerStackerAPIResponse = {
      success: false,
      error: "Failed to retrieve session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}