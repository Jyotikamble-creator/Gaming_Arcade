import { NextRequest, NextResponse } from "next/server";
import { 
  TowerStackerScoreResult, 
  TowerStackerAPIResponse, 
  TowerStackerScoreCalculation 
} from "@/types/games/tower-stacker";
import { calculateTowerStackerScore } from "@/lib/games/tower-stacker";
import { validateTowerStackerScore } from "@/utility/games/tower-stacker";

// POST /api/tower-stacker/calculate-score - Calculate score based on performance
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { level, perfectDrops, totalDrops, averageAccuracy, completionTime, userId } = body;

    // Validate required fields
    const validation = validateTowerStackerScore({
      level,
      perfectDrops,
      totalDrops,
      averageAccuracy
    });

    if (!validation.isValid) {
      const response: TowerStackerAPIResponse = {
        success: false,
        error: validation.error || "Invalid score calculation parameters",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Calculate comprehensive score
    const scoreResult: TowerStackerScoreResult = await calculateTowerStackerScore({
      level,
      perfectDrops: perfectDrops || 0,
      totalDrops: totalDrops || level,
      averageAccuracy: averageAccuracy || 0,
      completionTime,
      userId
    });

    const response: TowerStackerAPIResponse<TowerStackerScoreResult> = {
      success: true,
      data: scoreResult,
      message: "Score calculated successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error calculating tower stacker score:", error);
    
    const response: TowerStackerAPIResponse = {
      success: false,
      error: "Failed to calculate score",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}