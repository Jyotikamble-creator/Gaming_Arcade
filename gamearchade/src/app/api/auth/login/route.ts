// POST /api/auth/login - User login endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { generateToken } from '@/lib/auth/auth';
import { LoginRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('[AUTH] Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.warn('[AUTH] Login failed: missing email or password');
      return NextResponse.json(
        { error: 'email,password required' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[AUTH] Login failed: user not found:', email);
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Compare password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.warn('[AUTH] Login failed: invalid password for:', email);
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    console.log('[AUTH] Login successful for user:', user.email);

    // Respond with token and user info
    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
