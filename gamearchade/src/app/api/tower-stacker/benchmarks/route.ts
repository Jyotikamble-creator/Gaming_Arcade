import { NextRequest, NextResponse } from "next/server";
import { TowerStackerDifficultyBenchmarks, TowerStackerAPIResponse } from "@/types/games/tower-stacker";

// GET /api/tower-stacker/benchmarks - Get difficulty benchmarks
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const benchmarks: TowerStackerDifficultyBenchmarks = {
      beginner: { minLevel: 1, maxLevel: 5 },
      intermediate: { minLevel: 6, maxLevel: 10 },
      advanced: { minLevel: 11, maxLevel: 15 },
      expert: { minLevel: 16, maxLevel: 19 },
      master: { minLevel: 20, maxLevel: 20 }
    };

    const response: TowerStackerAPIResponse<TowerStackerDifficultyBenchmarks> = {
      success: true,
      data: benchmarks,
      message: "Difficulty benchmarks retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching tower stacker benchmarks:", error);
    
    const response: TowerStackerAPIResponse = {
      success: false,
      error: "Failed to retrieve difficulty benchmarks",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}