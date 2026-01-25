import { NextRequest, NextResponse } from "next/server";
import { 
  TypingPassage, 
  TypingAPIResponse, 
  TypingPassageRequest 
} from "@/types/games/typing";
import { getTypingPassage, getRandomTypingPassages } from "@/lib/games/typing";

// GET /api/typing/passage - Get typing passage(s)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: TypingPassageRequest = {
      difficulty: searchParams.get("difficulty") as any,
      category: searchParams.get("category") as any,
      minWords: searchParams.get("minWords") ? parseInt(searchParams.get("minWords")!) : undefined,
      maxWords: searchParams.get("maxWords") ? parseInt(searchParams.get("maxWords")!) : undefined,
      language: searchParams.get("language") || 'english',
      excludeUsed: searchParams.get("excludeUsed") === 'true',
      userId: searchParams.get("userId") || undefined
    };

    const multiple = searchParams.get("multiple") === 'true';
    const count = searchParams.get("count") ? parseInt(searchParams.get("count")!) : 1;

    let passages: TypingPassage | TypingPassage[];

    if (multiple) {
      passages = await getRandomTypingPassages(count, query);
    } else {
      passages = await getTypingPassage(query);
    }

    const response: TypingAPIResponse<TypingPassage | TypingPassage[]> = {
      success: true,
      data: passages,
      message: multiple ? `${count} typing passages retrieved successfully` : "Typing passage retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching typing passage:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to retrieve typing passage",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}