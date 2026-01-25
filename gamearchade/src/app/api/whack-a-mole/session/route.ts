import { NextRequest, NextResponse } from "next/server";
import { 
  WhackGameSession, 
  WhackAPIResponse,
  WhackUpdateRequest 
} from "@/types/games/whack-a-mole";
import { WhackSession } from "@/models/games/whack-a-mole";
import { 
  updateWhackGameSession, 
  pauseWhackSession, 
  resumeWhackSession 
} from "@/lib/games/whack-a-mole";

// GET /api/whack-a-mole/session?sessionId=xxx - Get session details
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const session = await WhackSession.findOne({ sessionId });

    if (!session) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session not found",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: WhackAPIResponse<WhackGameSession> = {
      success: true,
      data: session.toObject(),
      message: "Session retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving whack-a-mole session:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to retrieve session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/whack-a-mole/session - Update session
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: WhackUpdateRequest = await request.json();
    const { sessionId, action, data, timestamp } = body;

    if (!sessionId) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session ID is required",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    let updatedSession: WhackGameSession | null = null;

    switch (action) {
      case 'pause':
        updatedSession = await pauseWhackSession(sessionId);
        break;
      case 'resume':
        updatedSession = await resumeWhackSession(sessionId);
        break;
      case 'miss':
      case 'powerup':
        updatedSession = await updateWhackGameSession(sessionId, { action, data });
        break;
      default:
        const response: WhackAPIResponse = {
          success: false,
          error: "Invalid action",
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(response, { status: 400 });
    }

    if (!updatedSession) {
      const response: WhackAPIResponse = {
        success: false,
        error: "Session not found or update failed",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: WhackAPIResponse<WhackGameSession> = {
      success: true,
      data: updatedSession,
      message: "Session updated successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating whack-a-mole session:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to update session",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}