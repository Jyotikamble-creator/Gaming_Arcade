import { NextRequest, NextResponse } from "next/server";
import { 
  WhackSessionResult, 
  WhackAPIResponse 
} from "@/types/games/whack-a-mole";
import { WhackSession } from "@/models/games/whack-a-mole";
import { completeWhackGameSession } from "@/lib/games/whack-a-mole";

// POST /api/whack-a-mole/complete - Complete a game session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sessionId, endTime, finalScore } = body;

    if (!sessionId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Complete the game session
    const result = await completeWhackGameSession({
      sessionId,
      endTime: endTime ? new Date(endTime) : new Date(),
      finalScore
    });

    if (!result) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session not found or already completed",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: WhackAPIResponse<WhackSessionResult> = {
      success: true,
      data: result,
      message: "Game session completed successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error completing whack-a-mole session:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to complete session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}