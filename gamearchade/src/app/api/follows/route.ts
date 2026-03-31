// GET  /api/follows?type=followers|following&userId=<id>  — public list
// POST /api/follows  { followingId }                       — auth required
// DELETE /api/follows { followingId }                      — auth required
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { prisma } from '@/lib/api/prisma';

// ── GET /api/follows ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'followers';
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (type === 'followers') {
      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              email: true,
              displayName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json({
        followers: follows.map((f) => f.follower),
        count: follows.length,
      });
    } else {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              email: true,
              displayName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
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
    const target = await prisma.user.findUnique({
      where: { id: followingId }
    });
    
    if (!target) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.id,
          followingId: followingId
        }
      }
    });

    if (!existing) {
      // Create follow relationship
      await prisma.follow.create({
        data: {
          followerId: decoded.id,
          followingId: followingId
        }
      });

      // Update stats - use atomic increment
      await prisma.userStats.update({
        where: { userId: decoded.id },
        data: { followingCount: { increment: 1 } }
      }).catch(() => {
        // Create stats if doesn't exist
        return prisma.userStats.create({
          data: { userId: decoded.id, followingCount: 1 }
        });
      });

      await prisma.userStats.update({
        where: { userId: followingId },
        data: { followerCount: { increment: 1 } }
      }).catch(() => {
        return prisma.userStats.create({
          data: { userId: followingId, followerCount: 1 }
        });
      });
    } else {
      return NextResponse.json({ error: 'already following' }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'followed' }, { status: 201 });
  } catch (err: any) {
    console.error('[FOLLOWS] POST error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

// ── DELETE /api/follows ───────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
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

    const deleted = await prisma.follow.deleteMany({
      where: {
        followerId: decoded.id,
        followingId: followingId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'not following' }, { status: 404 });
    }

    // Decrement stats counters atomically (floor at 0)
    await prisma.userStats.update({
      where: { userId: decoded.id },
      data: { followingCount: { decrement: 1 } }
    }).catch(() => null);

    await prisma.userStats.update({
      where: { userId: followingId },
      data: { followerCount: { decrement: 1 } }
    }).catch(() => null);

    return NextResponse.json({ success: true, message: 'unfollowed' });
  } catch (err) {
    console.error('[FOLLOWS] DELETE error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
