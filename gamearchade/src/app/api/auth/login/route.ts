// POST /api/auth/login - User login endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { generateToken } from '@/lib/auth/auth';
import { LoginRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body first (before DB connection)
    let body: LoginRequest;
    try {
      body = await request.json();
    } catch (e) {
      console.warn('[AUTH] Login failed: invalid JSON');
      return NextResponse.json(
        { error: 'invalid request body' } as ErrorResponse,
        { status: 400 }
      );
    }

    const { email, password } = body;

    console.log('[AUTH] Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.warn('[AUTH] Login failed: missing email or password');
      return NextResponse.json(
        { error: 'email and password required' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('[AUTH] Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'service temporarily unavailable' } as ErrorResponse,
        { status: 503 }
      );
    }

    // Find user by email
    let user;
    try {
      user = await User.findOne({ email });
    } catch (queryError) {
      console.error('[AUTH] User query failed:', queryError);
      return NextResponse.json(
        { error: 'service temporarily unavailable' } as ErrorResponse,
        { status: 503 }
      );
    }

    if (!user) {
      console.warn('[AUTH] Login failed: user not found:', email);
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Compare password with stored hash
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } catch (cryptoError) {
      console.error('[AUTH] Password comparison failed:', cryptoError);
      return NextResponse.json(
        { error: 'authentication failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      console.warn('[AUTH] Login failed: invalid password for:', email);
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Generate JWT token
    let token: string;
    try {
      token = generateToken(user._id.toString(), user.email);
    } catch (tokenError) {
      console.error('[AUTH] Token generation failed:', tokenError);
      return NextResponse.json(
        { error: 'authentication failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    console.log('[AUTH] Login successful for user:', user.email);

    // Respond with token and user info
    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };

    const nextResponse = NextResponse.json(response);
    // Set HttpOnly session cookie for middleware-based page protection
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    nextResponse.headers.set(
      'Set-Cookie',
      `session-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
    );
    return nextResponse;
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
