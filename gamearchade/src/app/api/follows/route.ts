// GET  /api/follows?type=followers|following&userId=<id>  — public list
// POST /api/follows  { followingId }                       — auth required
// DELETE /api/follows { followingId }                      — auth required
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { prisma } from '@/lib/api/prisma';
import { applyRateLimit, RATE_LIMIT_CONFIG } from '@/lib/security/rateLimit';
import { checkCsrfToken } from '@/lib/security/csrf';
import { validateRequest, FollowRequestSchema, FollowQuerySchema } from '@/lib/security/validation';
import { logAudit, AuditAction, logSuspiciousActivity } from '@/lib/security/audit';

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

// ── GET /api/follows ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // ========== RATE LIMITING ==========
    const rateLimitResult = await applyRateLimit(request, RATE_LIMIT_CONFIG.social);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'followers';
    const userId = searchParams.get('userId');
    const clientIp = getClientIp(request);

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
    const clientIp = getClientIp(request);

    // ========== RATE LIMITING ==========
    const rateLimitResult = await applyRateLimit(request, RATE_LIMIT_CONFIG.social);
    if (!rateLimitResult.allowed) {
      await logSuspiciousActivity(undefined, 'Rate limit exceeded on follow', clientIp);
      return rateLimitResult.response!;
    }

    // ========== CSRF PROTECTION ==========
    const csrfCheck = await checkCsrfToken(request);
    if (!csrfCheck.valid) {
      await logSuspiciousActivity(undefined, 'CSRF token validation failed', clientIp);
      return csrfCheck.response!;
    }

    // ========== AUTHENTICATION ==========
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      await logSuspiciousActivity(undefined, 'Invalid token on follow', clientIp);
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    // ========== REQUEST VALIDATION ==========
    const validation = await validateRequest(request, FollowRequestSchema);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { followingId } = validation.data!;

    // No self-follow
    if (decoded.id === followingId) {
      await logAudit({
        userId: decoded.id,
        action: AuditAction.FOLLOW_USER,
        resource: followingId,
        status: 'failure',
        reason: 'Self-follow attempt',
        ipAddress: clientIp,
      });
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

      // ========== AUDIT LOG ==========
      await logAudit({
        userId: decoded.id,
        action: AuditAction.FOLLOW_USER,
        resource: followingId,
        status: 'success',
        ipAddress: clientIp,
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
    const clientIp = getClientIp(request);

    // ========== RATE LIMITING ==========
    const rateLimitResult = await applyRateLimit(request, RATE_LIMIT_CONFIG.social);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // ========== CSRF PROTECTION ==========
    const csrfCheck = await checkCsrfToken(request);
    if (!csrfCheck.valid) {
      return csrfCheck.response!;
    }

    // ========== AUTHENTICATION ==========
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

    // ========== REQUEST VALIDATION ==========
    const validation = await validateRequest(request, FollowRequestSchema);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { followingId } = validation.data!;

    const deleted = await prisma.follow.deleteMany({
      where: {
        followerId: decoded.id,
        followingId: followingId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'not following' }, { status: 404 });
    }

    // Decrement stats counters atomically
    await prisma.userStats.update({
      where: { userId: decoded.id },
      data: { followingCount: { decrement: 1 } }
    }).catch(() => null);

    await prisma.userStats.update({
      where: { userId: followingId },
      data: { followerCount: { decrement: 1 } }
    }).catch(() => null);

    // ========== AUDIT LOG ==========
    await logAudit({
      userId: decoded.id,
      action: AuditAction.UNFOLLOW_USER,
      resource: followingId,
      status: 'success',
      ipAddress: clientIp,
    });

    return NextResponse.json({ success: true, message: 'unfollowed' });
  } catch (err) {
    console.error('[FOLLOWS] DELETE error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
