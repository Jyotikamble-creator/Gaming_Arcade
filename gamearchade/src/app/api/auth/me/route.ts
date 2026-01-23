// GET /api/auth/me - Get current user info
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { UserResponse, ErrorResponse } from '@/types/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

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
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      console.warn('[AUTH] Me request: user not found:', decoded.email);
      return NextResponse.json(
        { error: 'user not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    console.log('[AUTH] Me request successful for user:', user.email);

    // Return user info
    const response: UserResponse = {
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        favoriteGame: user.favoriteGame,
        profileCompleted: user.profileCompleted,
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
