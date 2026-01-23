// PUT /api/auth/profile - Update user profile
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import { ProfileUpdateRequest, UserResponse, ErrorResponse } from '@/types/auth/auth';

export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
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
      return NextResponse.json(
        { error: 'invalid token' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Find user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'user not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    console.log('[AUTH] Profile update for user:', currentUser.email);

    // Parse request body
    const body: ProfileUpdateRequest = await request.json();
    const { displayName, bio, avatar, favoriteGame, username } = body;

    // Validate input
    if (displayName && (typeof displayName !== 'string' || displayName.length > 50)) {
      return NextResponse.json(
        { error: 'Display name must be a string under 50 characters' } as ErrorResponse,
        { status: 400 }
      );
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json(
        { error: 'Bio must be a string under 500 characters' } as ErrorResponse,
        { status: 400 }
      );
    }

    if (
      username &&
      (typeof username !== 'string' || username.length < 3 || username.length > 20)
    ) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Check if username is already taken
    if (username && username !== currentUser.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: currentUser._id },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' } as ErrorResponse,
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Partial<ProfileUpdateRequest> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (favoriteGame !== undefined) updateData.favoriteGame = favoriteGame;
    if (username !== undefined) updateData.username = username;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' } as ErrorResponse,
        { status: 404 }
      );
    }

    console.log('[AUTH] Profile updated successfully for user:', currentUser.email);

    // Return updated user info
    const response: UserResponse = {
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        favoriteGame: updatedUser.favoriteGame,
        profileCompleted: updatedUser.profileCompleted,
        createdAt: updatedUser.createdAt,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[AUTH] Profile update error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
