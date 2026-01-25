import { NextRequest, NextResponse } from "next/server";
import { 
  TypingGameSession, 
  TypingAPIResponse, 
  TypingSessionRequest,
  TypingUpdateRequest 
} from "@/types/games/typing";
import { TypingSession } from "@/models/games/typing";
import { createTypingSession, updateTypingSession } from "@/lib/games/typing";

// POST /api/typing/session - Create a new typing session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TypingSessionRequest = await request.json();
    const { userId, passageId, gameMode, timeLimit, wordLimit, settings } = body;

    if (!userId) {
      const response: TypingAPIResponse = {
        success: false,
        error: "User ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!gameMode) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Game mode is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create new typing session
    const session = await createTypingSession({
      userId,
      passageId,
      gameMode,
      timeLimit,
      wordLimit,
      settings
    });

    const response: TypingAPIResponse<TypingGameSession> = {
      success: true,
      data: session,
      message: "Typing session created successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating typing session:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to create typing session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/typing/session?sessionId=xxx - Get session details
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const session = await TypingSession.findById(sessionId);

    if (!session) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: TypingAPIResponse<TypingGameSession> = {
      success: true,
      data: session.toObject(),
      message: "Session retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving typing session:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to retrieve session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/typing/session - Update typing session
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TypingUpdateRequest = await request.json();
    const { sessionId, currentPosition, typedText, timestamp, keystroke } = body;

    if (!sessionId) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Update session with new typing data
    const updatedSession = await updateTypingSession({
      sessionId,
      currentPosition,
      typedText,
      timestamp,
      keystroke
    });

    if (!updatedSession) {
      const response: TypingAPIResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: TypingAPIResponse<TypingGameSession> = {
      success: true,
      data: updatedSession,
      message: "Session updated successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating typing session:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to update session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}