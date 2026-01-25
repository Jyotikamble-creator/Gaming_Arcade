import { NextRequest, NextResponse } from "next/server";
import { 
  WhackProfile, 
  WhackAPIResponse,
  WhackStatsQuery 
} from "@/types/games/whack-a-mole";
import { WhackSession } from "@/models/games/whack-a-mole";

// GET /api/whack-a-mole/stats - Get comprehensive game statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: WhackStatsQuery = {
      userId: searchParams.get("userId") || undefined,
      gameMode: searchParams.get("gameMode") as any,
      difficulty: searchParams.get("difficulty") as any,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      minScore: searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : undefined,
      maxScore: searchParams.get("maxScore") ? parseInt(searchParams.get("maxScore")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100,
      sortBy: (searchParams.get("sortBy") as any) || 'score',
      sortOrder: (searchParams.get("sortOrder") as any) || 'desc'
    };

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = {};
    if (query.userId) matchStage.userId = query.userId;
    if (query.gameMode) matchStage.gameMode = query.gameMode;
    if (query.difficulty) matchStage.difficulty = query.difficulty;
    if (query.startDate || query.endDate) {
      matchStage.startTime = {};
      if (query.startDate) matchStage.startTime.$gte = query.startDate;
      if (query.endDate) matchStage.startTime.$lte = query.endDate;
    }
    if (query.minScore) matchStage.currentScore = { ...matchStage.currentScore, $gte: query.minScore };
    if (query.maxScore) matchStage.currentScore = { ...matchStage.currentScore, $lte: query.maxScore };

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // User-specific statistics
    if (query.userId) {
      pipeline.push({
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          totalPlayTime: { $sum: "$duration" },
          totalScore: { $sum: "$currentScore" },
          averageScore: { $avg: "$currentScore" },
          bestScore: { $max: "$currentScore" },
          totalMolesHit: { $sum: "$molesHit" },
          totalMolesSpawned: { $sum: "$molesSpawned" },
          averageAccuracy: { $avg: "$statistics.accuracy" },
          bestAccuracy: { $max: "$statistics.accuracy" },
          averageReactionTime: { $avg: "$statistics.averageReactionTime" },
          fastestReaction: { $min: "$fastestReaction" },
          longestStreak: { $max: "$streakBest" },
          totalPowerUpsUsed: { $sum: "$powerUpsUsed" },
          lastPlayed: { $max: "$startTime" },
          gameModes: { $addToSet: "$gameMode" },
          difficulties: { $addToSet: "$difficulty" },
          scoreHistory: { $push: "$currentScore" },
          accuracyHistory: { $push: "$statistics.accuracy" },
          reactionTimeHistory: { $push: "$statistics.averageReactionTime" }
        }
      });

      pipeline.push({
        $project: {
          userId: "$_id",
          totalSessions: 1,
          totalPlayTime: 1,
          totalScore: 1,
          averageScore: { $round: ["$averageScore", 2] },
          bestScore: 1,
          totalMolesHit: 1,
          totalMolesSpawned: 1,
          averageAccuracy: { $round: [{ $multiply: ["$averageAccuracy", 100] }, 2] },
          bestAccuracy: { $round: [{ $multiply: ["$bestAccuracy", 100] }, 2] },
          averageReactionTime: { $round: ["$averageReactionTime", 0] },
          fastestReaction: 1,
          longestStreak: 1,
          totalPowerUpsUsed: 1,
          lastPlayed: 1,
          favoriteGameMode: { $arrayElemAt: ["$gameModes", 0] },
          preferredDifficulty: { $arrayElemAt: ["$difficulties", 0] },
          consistencyRating: {
            $round: [
              {
                $cond: [
                  { $gt: [{ $size: "$reactionTimeHistory" }, 1] },
                  {
                    $subtract: [
                      1,
                      {
                        $divide: [
                          {
                            $sqrt: {
                              $divide: [
                                {
                                  $reduce: {
                                    input: "$reactionTimeHistory",
                                    initialValue: 0,
                                    in: {
                                      $add: [
                                        "$$value",
                                        {
                                          $pow: [
                                            { $subtract: ["$$this", "$averageReactionTime"] },
                                            2
                                          ]
                                        }
                                      ]
                                    }
                                  }
                                },
                                { $size: "$reactionTimeHistory" }
                              ]
                            }
                          },
                          { $max: ["$averageReactionTime", 1] }
                        ]
                      }
                    ]
                  },
                  1
                ]
              },
              3
            ]
          }
        }
      });
    } else {
      // Global statistics
      pipeline.push({
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalPlayers: { $addToSet: "$userId" },
          averageScore: { $avg: "$currentScore" },
          highestScore: { $max: "$currentScore" },
          averageAccuracy: { $avg: "$statistics.accuracy" },
          highestAccuracy: { $max: "$statistics.accuracy" },
          averageReactionTime: { $avg: "$statistics.averageReactionTime" },
          fastestReaction: { $min: "$fastestReaction" },
          totalMolesHit: { $sum: "$molesHit" },
          totalMolesSpawned: { $sum: "$molesSpawned" },
          totalPlayTime: { $sum: "$duration" }
        }
      });

      pipeline.push({
        $project: {
          _id: 0,
          totalSessions: 1,
          totalPlayers: { $size: "$totalPlayers" },
          averageScore: { $round: ["$averageScore", 2] },
          highestScore: 1,
          averageAccuracy: { $round: [{ $multiply: ["$averageAccuracy", 100] }, 2] },
          highestAccuracy: { $round: [{ $multiply: ["$highestAccuracy", 100] }, 2] },
          averageReactionTime: { $round: ["$averageReactionTime", 0] },
          fastestReaction: 1,
          totalMolesHit: 1,
          totalMolesSpawned: 1,
          globalAccuracy: {
            $round: [
              {
                $cond: [
                  { $gt: ["$totalMolesSpawned", 0] },
                  { $multiply: [{ $divide: ["$totalMolesHit", "$totalMolesSpawned"] }, 100] },
                  0
                ]
              },
              2
            ]
          },
          totalPlayTime: 1
        }
      });
    }

    const results = await WhackSession.aggregate(pipeline);

    let statisticsData: any = null;
    if (query.userId) {
      statisticsData = results[0] || {
        userId: query.userId,
        totalSessions: 0,
        totalPlayTime: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        totalMolesHit: 0,
        totalMolesSpawned: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        averageReactionTime: 0,
        fastestReaction: 0,
        longestStreak: 0,
        totalPowerUpsUsed: 0,
        consistencyRating: 0,
        lastPlayed: null,
        favoriteGameMode: 'classic',
        preferredDifficulty: 'normal'
      };
    } else {
      statisticsData = results[0] || {
        totalSessions: 0,
        totalPlayers: 0,
        averageScore: 0,
        highestScore: 0,
        averageAccuracy: 0,
        highestAccuracy: 0,
        averageReactionTime: 0,
        fastestReaction: 0,
        totalMolesHit: 0,
        totalMolesSpawned: 0,
        globalAccuracy: 0,
        totalPlayTime: 0
      };
    }

    const response: WhackAPIResponse<any> = {
      success: true,
      data: statisticsData,
      message: "Statistics retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving whack-a-mole statistics:", error);
    
    const response: WhackAPIResponse = {
      success: false,
      error: "Failed to retrieve statistics",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}