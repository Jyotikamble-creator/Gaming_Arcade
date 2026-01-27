import { NextRequest, NextResponse } from "next/server";
import { 
  WhackGameSession, 
  WhackAPIResponse, 
  WhackStartRequest,
  WhackGameConfiguration 
} from "@/types/games/whack-a-mole";
import { createWhackGameSession, getWhackGameConfiguration } from "@/lib/games/whack-a-mole";

// GET /api/whack-a-mole/start - Start a new Whack-a-Mole game
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "guest";
    const gameMode = (searchParams.get("gameMode") as any) || "classic";
    const difficulty = (searchParams.get("difficulty") as any) || "normal";

    // Get game configuration
    const config = getWhackGameConfiguration();
    const gridSize = config.gridSizes[difficulty];
    const duration = config.durations[gameMode];

    // For simple compatibility with original API
    const simpleResponse = {
      gridSize,
      duration,
      maxMoles: config.maxSimultaneousMoles[difficulty],
      spawnRate: config.spawnRates[difficulty],
      moleVisibility: config.moleVisibilityTime[difficulty],
      difficulty,
      gameMode
    };

    const response: WhackAPIResponse<any> = {
      success: true,
      data: simpleResponse,
      message: "Game configuration retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error starting whack-a-mole game:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to start game",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/whack-a-mole/start - Create a new game session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: WhackStartRequest = await request.json();
    const { userId, gameMode = "classic", difficulty = "normal", customSettings } = body;

    if (!userId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "User ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create new game session
    const gameSession = await createWhackGameSession({
      userId,
      gameMode,
      difficulty,
      customSettings
    });

    const response: WhackAPIResponse<WhackGameSession> = {
      success: true,
      data: gameSession,
      message: "Game session created successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating whack-a-mole session:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to create game session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}