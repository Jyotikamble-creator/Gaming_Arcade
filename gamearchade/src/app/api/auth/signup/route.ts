// POST /api/auth/signup - User signup endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { generateToken } from '@/lib/auth/auth';
import { SignupRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body first (before DB connection)
    let body: SignupRequest;
    try {
      body = await request.json();
    } catch (e) {
      console.warn('[AUTH] Signup failed: invalid JSON');
      return NextResponse.json(
        { error: 'invalid request body' } as ErrorResponse,
        { status: 400 }
      );
    }

    const { email, password } = body;

    console.log('[AUTH] Signup attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.warn('[AUTH] Signup failed: missing email or password');
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

    // Check if email is already in use
    let existing;
    try {
      existing = await User.findOne({ email });
    } catch (queryError) {
      console.error('[AUTH] User query failed:', queryError);
      return NextResponse.json(
        { error: 'service temporarily unavailable' } as ErrorResponse,
        { status: 503 }
      );
    }

    if (existing) {
      console.warn('[AUTH] Signup failed: email already in use:', email);
      return NextResponse.json(
        { error: 'email already in use' } as ErrorResponse,
        { status: 409 }
      );
    }

    // Hash the password
    let salt, hash, user, token;
    try {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
      user = await User.create({ email, passwordHash: hash });
      token = generateToken(user._id.toString(), user.email);
    } catch (cryptoError) {
      console.error('[AUTH] Encryption/user creation failed:', cryptoError);
      return NextResponse.json(
        { error: 'signup failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    console.log('[AUTH] Signup successful for user:', user.email);

    // Respond with token and user info
    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };

    const nextResponse = NextResponse.json(response, { status: 201 });
    // Set HttpOnly session cookie for middleware-based page protection
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    nextResponse.headers.set(
      'Set-Cookie',
      `session-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
    );
    return nextResponse;
  } catch (err) {
    console.error('[AUTH] Signup error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
