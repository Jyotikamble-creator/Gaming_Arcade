// GET  /api/follows?type=followers|following&userId=<id>  — public list
// POST /api/follows  { followingId }                       — auth required
// DELETE /api/follows { followingId }                      — auth required
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/models/db';
import Follow from '@/models/common/Follow';
import User from '@/models/auth/auth';
import { verifyToken, extractToken } from '@/lib/auth/auth';

// ── GET /api/follows ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'followers';
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (type === 'followers') {
      const follows = await Follow.find({ following: userId })
        .populate('follower', '_id email displayName username avatar')
        .sort({ createdAt: -1 });
      return NextResponse.json({
        followers: follows.map((f) => f.follower),
        count: follows.length,
      });
    } else {
      const follows = await Follow.find({ follower: userId })
        .populate('following', '_id email displayName username avatar')
        .sort({ createdAt: -1 });
      return NextResponse.json({
        following: follows.map((f) => f.following),
        count: follows.length,
      });
    }
  } catch (err) {
    console.error('[FOLLOWS] GET error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

// ── POST /api/follows ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'followingId required' }, { status: 400 });
    }

    // No self-follow
    if (decoded.id === followingId) {
      return NextResponse.json({ error: 'cannot follow yourself' }, { status: 400 });
    }

    // Target user must exist
    const target = await User.findById(followingId);
    if (!target) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    // Upsert to avoid race conditions on duplicate
    await Follow.findOneAndUpdate(
      { follower: decoded.id, following: followingId },
      { follower: decoded.id, following: followingId },
      { upsert: true, new: true }
    );

    // Increment stats counters atomically
    await User.findByIdAndUpdate(decoded.id, { $inc: { 'stats.followingCount': 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { 'stats.followerCount': 1 } });

    return NextResponse.json({ success: true, message: 'followed' }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'already following' }, { status: 409 });
    }
    console.error('[FOLLOWS] POST error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

// ── DELETE /api/follows ───────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

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

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'followingId required' }, { status: 400 });
    }

    const deleted = await Follow.findOneAndDelete({
      follower: decoded.id,
      following: followingId,
    });

    if (!deleted) {
      return NextResponse.json({ error: 'not following' }, { status: 404 });
    }

    // Decrement stats counters atomically (floor at 0 via $max)
    await User.findByIdAndUpdate(decoded.id, [
      { $set: { 'stats.followingCount': { $max: [{ $subtract: ['$stats.followingCount', 1] }, 0] } } },
    ]);
    await User.findByIdAndUpdate(followingId, [
      { $set: { 'stats.followerCount': { $max: [{ $subtract: ['$stats.followerCount', 1] }, 0] } } },
    ]);

    return NextResponse.json({ success: true, message: 'unfollowed' });
  } catch (err) {
    console.error('[FOLLOWS] DELETE error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
