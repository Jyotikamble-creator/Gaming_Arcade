// GET /api/auth/user-stats — returns stats for the authenticated user
// Optional query: ?userId=<id> to fetch another user's public stats (still requires auth)
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { prisma } from '@/lib/api/prisma';

export async function GET(request: NextRequest) {
  try {
    // Auth required for all stat requests
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    // If querying another user, allow it (social feature) but caller must be authenticated
    const targetId = queryUserId || decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    // Get user stats
    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      stats: stats ? {
        followerCount: stats.followerCount,
        followingCount: stats.followingCount,
        totalScore: stats.totalScore,
        gamesPlayed: stats.gamesPlayed,
      } : {
        followerCount: 0,
        followingCount: 0,
        totalScore: 0,
        gamesPlayed: 0,
      },
    });
  } catch (err) {
    console.error('[USER-STATS] GET error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
