import { NextRequest, NextResponse } from "next/server";
import { 
  TowerStackerStatistics, 
  TowerStackerAPIResponse,
  TowerStackerStatsQuery 
} from "@/types/games/tower-stacker";
import { TowerStackerSession } from "@/models/games/tower-stacker";

// GET /api/tower-stacker/stats - Get comprehensive statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: TowerStackerStatsQuery = {
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      minLevel: searchParams.get("minLevel") ? parseInt(searchParams.get("minLevel")!) : undefined,
      maxLevel: searchParams.get("maxLevel") ? parseInt(searchParams.get("maxLevel")!) : undefined,
      difficulty: searchParams.get("difficulty") as any,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100,
      sortBy: (searchParams.get("sortBy") as any) || 'score',
      sortOrder: (searchParams.get("sortOrder") as any) || 'desc'
    };

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = {};
    if (query.userId) matchStage.userId = query.userId;
    if (query.startDate || query.endDate) {
      matchStage.startTime = {};
      if (query.startDate) matchStage.startTime.$gte = query.startDate;
      if (query.endDate) matchStage.startTime.$lte = query.endDate;
    }
    if (query.minLevel) matchStage.maxLevel = { ...matchStage.maxLevel, $gte: query.minLevel };
    if (query.maxLevel) matchStage.maxLevel = { ...matchStage.maxLevel, $lte: query.maxLevel };

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Group stage for user statistics
    if (query.userId) {
      pipeline.push({
        $group: {
          _id: "$userId",
          totalGames: { $sum: 1 },
          gamesCompleted: {
            $sum: {
              $cond: [{ $eq: ["$gameState", "completed"] }, 1, 0]
            }
          },
          highestLevel: { $max: "$maxLevel" },
          bestScore: { $max: "$score" },
          totalPerfectDrops: { $sum: "$perfectDrops" },
          totalDrops: { $sum: "$totalDrops" },
          totalPlayTime: { $sum: "$totalTime" },
          bestTime: { $min: "$totalTime" },
          longestStreak: { $max: "$bestStreak" },
          lastPlayed: { $max: "$startTime" },
          scores: { $push: "$score" },
          accuracyData: { $push: "$averageAccuracy" },
          levelData: { $push: "$maxLevel" }
        }
      });

      pipeline.push({
        $project: {
          userId: "$_id",
          totalGames: 1,
          gamesCompleted: 1,
          highestLevel: 1,
          bestScore: 1,
          totalPerfectDrops: 1,
          totalDrops: 1,
          averageAccuracy: {
            $cond: [
              { $gt: ["$totalDrops", 0] },
              { $divide: ["$totalPerfectDrops", "$totalDrops"] },
              0
            ]
          },
          bestAccuracy: { $max: "$accuracyData" },
          totalPlayTime: 1,
          averageGameTime: {
            $cond: [
              { $gt: ["$totalGames", 0] },
              { $divide: ["$totalPlayTime", "$totalGames"] },
              0
            ]
          },
          bestTime: 1,
          longestStreak: 1,
          lastPlayed: 1,
          scoreHistory: "$scores",
          accuracyHistory: "$accuracyData",
          levelDistribution: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ["$levelData"] },
                as: "level",
                in: {
                  k: { $toString: "$$level" },
                  v: {
                    $size: {
                      $filter: {
                        input: "$levelData",
                        cond: { $eq: ["$$this", "$$level"] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    } else {
      // Global statistics
      pipeline.push({
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalPlayers: { $addToSet: "$userId" },
          averageScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
          averageLevel: { $avg: "$maxLevel" },
          highestLevel: { $max: "$maxLevel" },
          totalPerfectDrops: { $sum: "$perfectDrops" },
          averageAccuracy: { $avg: "$averageAccuracy" },
          averageGameTime: { $avg: "$totalTime" }
        }
      });

      pipeline.push({
        $project: {
          _id: 0,
          totalGames: 1,
          totalPlayers: { $size: "$totalPlayers" },
          averageScore: { $round: ["$averageScore", 2] },
          highestScore: 1,
          averageLevel: { $round: ["$averageLevel", 2] },
          highestLevel: 1,
          totalPerfectDrops: 1,
          averageAccuracy: { $round: ["$averageAccuracy", 4] },
          averageGameTime: { $round: ["$averageGameTime", 2] }
        }
      });
    }

    const results = await TowerStackerSession.aggregate(pipeline);

    let statisticsData: any = null;
    if (query.userId) {
      statisticsData = results[0] || {
        userId: query.userId,
        totalGames: 0,
        gamesCompleted: 0,
        highestLevel: 0,
        bestScore: 0,
        totalPerfectDrops: 0,
        totalDrops: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        totalPlayTime: 0,
        averageGameTime: 0,
        bestTime: 0,
        longestStreak: 0,
        achievements: [],
        lastPlayed: null,
        levelDistribution: {},
        accuracyHistory: [],
        scoreHistory: []
      };
    } else {
      statisticsData = results[0] || {
        totalGames: 0,
        totalPlayers: 0,
        averageScore: 0,
        highestScore: 0,
        averageLevel: 0,
        highestLevel: 0,
        totalPerfectDrops: 0,
        averageAccuracy: 0,
        averageGameTime: 0
      };
    }

    const response: TowerStackerAPIResponse<any> = {
      success: true,
      data: statisticsData,
      message: "Statistics retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving tower stacker statistics:", error);
    
    const response: TowerStackerAPIResponse = {
      success: false,
      error: "Failed to retrieve statistics",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}