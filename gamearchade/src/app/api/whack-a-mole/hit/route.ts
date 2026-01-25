import { NextRequest, NextResponse } from "next/server";
import { 
  WhackGameSession, 
  WhackAPIResponse,
  WhackHitRequest 
} from "@/types/games/whack-a-mole";
import { WhackSession } from "@/models/games/whack-a-mole";
import { processWhackMoleHit } from "@/lib/games/whack-a-mole";

// POST /api/whack-a-mole/hit - Process a mole hit
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: WhackHitRequest = await request.json();
    const { sessionId, moleId, hitPosition, reactionTime, timestamp } = body;

    if (!sessionId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!moleId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Mole ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Process the hit
    const result = await processWhackMoleHit({
      sessionId,
      moleId,
      hitPosition,
      reactionTime,
      timestamp
    });

    if (!result.success) {
      const response: WhackAPIResponse = {
        success: false,
        error: result.error || "Failed to process hit",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: WhackAPIResponse<any> = {
      success: true,
      data: {
        points: result.points,
        streakCount: result.streakCount,
        comboMultiplier: result.comboMultiplier,
        isPerfect: result.isPerfect,
        newScore: result.newScore,
        powerUpTriggered: result.powerUpTriggered,
        achievement: result.achievement
      },
      message: "Mole hit processed successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error processing whack-a-mole hit:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to process hit",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}