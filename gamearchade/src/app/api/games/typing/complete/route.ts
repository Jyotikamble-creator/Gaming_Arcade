import { NextRequest, NextResponse } from "next/server";
import { 
  TypingSessionResult, 
  TypingAPIResponse 
} from "@/types/games/typing";
import { TypingSession } from "@/models/games/typing";
import { completeTypingSession } from "@/lib/games/typing";

// POST /api/typing/complete - Complete a typing session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sessionId, finalText, endTime } = body;

    if (!sessionId) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Complete the typing session and calculate results
    const result = await completeTypingSession({
      sessionId,
      finalText,
      endTime: endTime ? new Date(endTime) : new Date()
    });

    if (!result) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session not found or already completed",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: TypingAPIResponse<TypingSessionResult> = {
      success: true,
      data: result,
      message: "Typing session completed successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error completing typing session:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to complete typing session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}