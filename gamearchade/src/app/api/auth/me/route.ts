// GET /api/auth/me - Get current user info
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { UserResponse, ErrorResponse } from '@/types/auth/auth';
import { prisma } from '@/lib/api/prisma';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      console.warn('[AUTH] Me request: no token');
      return NextResponse.json(
        { error: 'no token' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      console.error('[AUTH] Me request error:', err);
      return NextResponse.json(
        { error: 'invalid token' } as ErrorResponse,
        { status: 401 }
      );
    }

    console.log('[AUTH] Me request for user:', decoded.email);

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        favoriteGame: true,
        profileCompleted: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.warn('[AUTH] Me request: user not found:', decoded.email);
      return NextResponse.json(
        { error: 'user not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    console.log('[AUTH] Me request successful for user:', user.email);

    // Get user stats from UserStats table or create default
    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id }
    });

    // Return user info
    const response: UserResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? undefined,
        displayName: user.displayName ?? undefined,
        bio: user.bio ?? undefined,
        avatar: user.avatar ?? undefined,
        favoriteGame: user.favoriteGame ?? undefined,
        profileCompleted: user.profileCompleted,
        role: user.role,
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
        createdAt: user.createdAt,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[AUTH] Me request error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
