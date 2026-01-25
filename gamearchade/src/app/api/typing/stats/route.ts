import { NextRequest, NextResponse } from "next/server";
import { 
  TypingProfile, 
  TypingAPIResponse,
  TypingStatsQuery 
} from "@/types/games/typing";
import { TypingSession } from "@/models/games/typing";

// GET /api/typing/stats - Get comprehensive typing statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: TypingStatsQuery = {
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      difficulty: searchParams.get("difficulty") as any,
      category: searchParams.get("category") as any,
      gameMode: searchParams.get("gameMode") as any,
      minWpm: searchParams.get("minWpm") ? parseInt(searchParams.get("minWpm")!) : undefined,
      maxWpm: searchParams.get("maxWpm") ? parseInt(searchParams.get("maxWpm")!) : undefined,
      minAccuracy: searchParams.get("minAccuracy") ? parseFloat(searchParams.get("minAccuracy")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100,
      sortBy: (searchParams.get("sortBy") as any) || 'date',
      sortOrder: (searchParams.get("sortOrder") as any) || 'desc'
    };

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = { isCompleted: true };
    if (query.userId) matchStage.userId = query.userId;
    if (query.startDate || query.endDate) {
      matchStage.startTime = {};
      if (query.startDate) matchStage.startTime.$gte = query.startDate;
      if (query.endDate) matchStage.startTime.$lte = query.endDate;
    }
    if (query.difficulty) matchStage['passage.difficulty'] = query.difficulty;
    if (query.category) matchStage['passage.category'] = query.category;
    if (query.gameMode) matchStage.gameMode = query.gameMode;
    if (query.minWpm) matchStage['statistics.wpm'] = { ...matchStage['statistics.wpm'], $gte: query.minWpm };
    if (query.maxWpm) matchStage['statistics.wpm'] = { ...matchStage['statistics.wpm'], $lte: query.maxWpm };
    if (query.minAccuracy) matchStage['statistics.accuracy'] = { $gte: query.minAccuracy };

    pipeline.push({ $match: matchStage });

    // User-specific statistics
    if (query.userId) {
      pipeline.push({
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          totalTimeTyped: { $sum: "$statistics.timeElapsed" },
          totalCharactersTyped: { $sum: "$statistics.totalCharacters" },
          totalWordsTyped: { $sum: "$statistics.totalWords" },
          averageWpm: { $avg: "$statistics.wpm" },
          bestWpm: { $max: "$statistics.wpm" },
          averageAccuracy: { $avg: "$statistics.accuracy" },
          bestAccuracy: { $max: "$statistics.accuracy" },
          totalMistakes: { $sum: "$statistics.incorrectCharacters" },
          averageSessionTime: { $avg: "$statistics.timeElapsed" },
          lastActive: { $max: "$startTime" },
          wpmData: { $push: "$statistics.wpm" },
          accuracyData: { $push: "$statistics.accuracy" },
          sessionDates: { $push: "$startTime" },
          difficulties: { $push: "$passage.difficulty" },
          categories: { $push: "$passage.category" },
          gameModes: { $push: "$gameMode" }
        }
      });

      pipeline.push({
        $project: {
          userId: "$_id",
          totalSessions: 1,
          totalTimeTyped: 1,
          totalCharactersTyped: 1,
          totalWordsTyped: 1,
          averageWpm: { $round: ["$averageWpm", 2] },
          bestWpm: 1,
          averageAccuracy: { $round: [{ $multiply: ["$averageAccuracy", 100] }, 2] },
          bestAccuracy: { $round: [{ $multiply: ["$bestAccuracy", 100] }, 2] },
          totalMistakes: 1,
          averageSessionTime: { $round: ["$averageSessionTime", 0] },
          lastActive: 1,
          consistencyRating: {
            $round: [
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
                                input: "$wpmData",
                                initialValue: 0,
                                in: {
                                  $add: [
                                    "$$value",
                                    {
                                      $pow: [
                                        { $subtract: ["$$this", "$averageWpm"] },
                                        2
                                      ]
                                    }
                                  ]
                                }
                              }
                            },
                            { $size: "$wpmData" }
                          ]
                        }
                      },
                      { $max: ["$averageWpm", 1] }
                    ]
                  }
                ]
              },
              3
            ]
          },
          preferredDifficulties: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ["$difficulties"] },
                as: "difficulty",
                in: {
                  k: "$$difficulty",
                  v: {
                    $size: {
                      $filter: {
                        input: "$difficulties",
                        cond: { $eq: ["$$this", "$$difficulty"] }
                      }
                    }
                  }
                }
              }
            }
          },
          categoryPreferences: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ["$categories"] },
                as: "category",
                in: {
                  k: "$$category",
                  v: {
                    $size: {
                      $filter: {
                        input: "$categories",
                        cond: { $eq: ["$$this", "$$category"] }
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
          totalSessions: { $sum: 1 },
          totalUsers: { $addToSet: "$userId" },
          averageWpm: { $avg: "$statistics.wpm" },
          highestWpm: { $max: "$statistics.wpm" },
          averageAccuracy: { $avg: "$statistics.accuracy" },
          highestAccuracy: { $max: "$statistics.accuracy" },
          totalCharacters: { $sum: "$statistics.totalCharacters" },
          totalWords: { $sum: "$statistics.totalWords" },
          averageSessionTime: { $avg: "$statistics.timeElapsed" }
        }
      });

      pipeline.push({
        $project: {
          _id: 0,
          totalSessions: 1,
          totalUsers: { $size: "$totalUsers" },
          averageWpm: { $round: ["$averageWpm", 2] },
          highestWpm: 1,
          averageAccuracy: { $round: [{ $multiply: ["$averageAccuracy", 100] }, 2] },
          highestAccuracy: { $round: [{ $multiply: ["$highestAccuracy", 100] }, 2] },
          totalCharacters: 1,
          totalWords: 1,
          averageSessionTime: { $round: ["$averageSessionTime", 0] }
        }
      });
    }

    const results = await TypingSession.aggregate(pipeline);

    let statisticsData: any = null;
    if (query.userId) {
      statisticsData = results[0] || {
        userId: query.userId,
        totalSessions: 0,
        totalTimeTyped: 0,
        totalCharactersTyped: 0,
        totalWordsTyped: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        totalMistakes: 0,
        averageSessionTime: 0,
        consistencyRating: 0,
        lastActive: null,
        preferredDifficulties: {},
        categoryPreferences: {}
      };
    } else {
      statisticsData = results[0] || {
        totalSessions: 0,
        totalUsers: 0,
        averageWpm: 0,
        highestWpm: 0,
        averageAccuracy: 0,
        highestAccuracy: 0,
        totalCharacters: 0,
        totalWords: 0,
        averageSessionTime: 0
      };
    }

    const response: TypingAPIResponse<any> = {
      success: true,
      data: statisticsData,
      message: "Statistics retrieved successfully",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving typing statistics:", error);
    
    const response: TypingAPIResponse = {
      success: false,
      error: "Failed to retrieve statistics",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}