// POST /api/auth/signup - User signup endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';
import { generateToken } from '@/lib/auth/auth';
import { SignupRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body: SignupRequest = await request.json();
    const { email, password } = body;

    console.log('[AUTH] Signup attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.warn('[AUTH] Signup failed: missing email or password');
      return NextResponse.json(
        { error: 'email,password required' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existing = await User.findOne({ email });

    if (existing) {
      console.warn('[AUTH] Signup failed: email already in use:', email);
      return NextResponse.json(
        { error: 'email already in use' } as ErrorResponse,
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({ email, passwordHash: hash });

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    console.log('[AUTH] Signup successful for user:', user.email);

    // Respond with token and user info
    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('[AUTH] Signup error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
