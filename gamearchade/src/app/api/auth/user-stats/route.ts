// GET /api/auth/user-stats — returns stats for the authenticated user
// Optional query: ?userId=<id> to fetch another user's public stats (still requires auth)
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { verifyToken, extractToken } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const user = await User.findById(targetId).select(
      'displayName username email stats'
    );
    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user._id.toString(),
      displayName: user.displayName,
      username: user.username,
      stats: user.stats ?? {
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
