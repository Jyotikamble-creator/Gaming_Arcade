// POST /api/auth/login - User login endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth/auth';
import { LoginRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';
import { prisma } from '@/lib/api/prisma';
import { applyRateLimit, RATE_LIMIT_CONFIG } from '@/lib/security/rateLimit';
import { createCsrfToken, addCsrfTokenToResponse } from '@/lib/security/csrf';
import { validateRequest, LoginRequestSchema } from '@/lib/security/validation';
import { logAuthAttempt, detectSuspiciousPatterns, logSuspiciousActivity } from '@/lib/security/audit';

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

/**
 * Get user agent from request
 */
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const userAgent = getUserAgent(request);

    // ========== RATE LIMITING ==========
    const rateLimitResult = await applyRateLimit(request, RATE_LIMIT_CONFIG.auth);
    if (!rateLimitResult.allowed) {
      await logSuspiciousActivity(undefined, 'Rate limit exceeded on login', clientIp);
      return rateLimitResult.response!;
    }

    // ========== REQUEST VALIDATION ==========
    const validation = await validateRequest(request, LoginRequestSchema);
    if (!validation.valid) {
      console.warn('[AUTH] Login validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error } as ErrorResponse,
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    console.log('[AUTH] Login attempt for email:', email, 'from IP:', clientIp);

    // ========== FIND USER ==========
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } catch (queryError) {
      console.error('[AUTH] User query failed:', queryError);
      await logAuthAttempt(email, false, clientIp, userAgent, 'Database error');
      return NextResponse.json(
        { error: 'service temporarily unavailable' } as ErrorResponse,
        { status: 503 }
      );
    }

    if (!user) {
      console.warn('[AUTH] Login failed: user not found:', email);
      await logAuthAttempt(email, false, clientIp, userAgent, 'User not found');
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // ========== VERIFY PASSWORD ==========
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } catch (cryptoError) {
      console.error('[AUTH] Password comparison failed:', cryptoError);
      await logAuthAttempt(email, false, clientIp, userAgent, 'Password comparison error');
      return NextResponse.json(
        { error: 'authentication failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      console.warn('[AUTH] Login failed: invalid password for:', email);
      await logAuthAttempt(email, false, clientIp, userAgent, 'Invalid password');
      
      // Check for suspicious patterns (multiple failed attempts)
      const suspicious = detectSuspiciousPatterns(user.id);
      if (suspicious.suspicious && suspicious.reason) {
        await logSuspiciousActivity(user.id, suspicious.reason, clientIp);
      }
      
      return NextResponse.json(
        { error: 'invalid credentials' } as ErrorResponse,
        { status: 401 }
      );
    }

    // ========== GENERATE JWT TOKEN ==========
    let token: string;
    try {
      token = generateToken(user.id, user.email);
    } catch (tokenError) {
      console.error('[AUTH] Token generation failed:', tokenError);
      await logAuthAttempt(email, false, clientIp, userAgent, 'Token generation failed');
      return NextResponse.json(
        { error: 'authentication failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    // ========== LOG SUCCESSFUL LOGIN ==========
    await logAuthAttempt(email, true, clientIp, userAgent);
    console.log('[AUTH] Login successful for user:', user.email);

    // ========== GENERATE CSRF TOKEN ==========
    const csrfToken = createCsrfToken(request);

    // ========== PREPARE RESPONSE ==========
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };

    const nextResponse = NextResponse.json(response);

    // Add CSRF token to response headers
    addCsrfTokenToResponse(nextResponse, csrfToken);

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
