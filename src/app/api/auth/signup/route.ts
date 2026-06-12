// POST /api/auth/signup - User signup endpoint
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth/auth';
import { SignupRequest, AuthResponse, ErrorResponse } from '@/types/auth/auth';
import { prisma } from '@/lib/api/prisma';
import { applyRateLimit, RATE_LIMIT_CONFIG } from '@/lib/security/rateLimit';
import { createCsrfToken, addCsrfTokenToResponse } from '@/lib/security/csrf';
import { validateRequest, SignupRequestSchema } from '@/lib/security/validation';
import { logAudit, AuditAction } from '@/lib/security/audit';

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // ========== RATE LIMITING ==========
    const rateLimitResult = await applyRateLimit(request, RATE_LIMIT_CONFIG.auth);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // ========== REQUEST VALIDATION ==========
    const validation = await validateRequest(request, SignupRequestSchema);
    if (!validation.valid) {
      console.warn('[AUTH] Signup validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error } as ErrorResponse,
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    console.log('[AUTH] Signup attempt for email:', email, 'from IP:', clientIp);

    // ========== CHECK IF EMAIL EXISTS ==========
    let existing;
    try {
      existing = await prisma.user.findUnique({
        where: { email }
      });
    } catch (queryError) {
      console.error('[AUTH] User query failed:', queryError);
      await logAudit({
        action: AuditAction.AUTH_SIGNUP,
        resource: email,
        status: 'failure',
        reason: 'Database error',
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { error: 'service temporarily unavailable' } as ErrorResponse,
        { status: 503 }
      );
    }

    if (existing) {
      console.warn('[AUTH] Signup failed: email already in use:', email);
      await logAudit({
        action: AuditAction.AUTH_SIGNUP,
        resource: email,
        status: 'failure',
        reason: 'Email already exists',
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { error: 'email already in use' } as ErrorResponse,
        { status: 409 }
      );
    }

    // ========== HASH PASSWORD & CREATE USER ==========
    let salt, hash, user, token;
    try {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: hash
        }
      });
      token = generateToken(user.id, user.email);
    } catch (cryptoError) {
      console.error('[AUTH] Encryption/user creation failed:', cryptoError);
      await logAudit({
        action: AuditAction.AUTH_SIGNUP,
        resource: email,
        status: 'failure',
        reason: 'Creation error',
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { error: 'signup failed' } as ErrorResponse,
        { status: 500 }
      );
    }

    // ========== LOG SUCCESSFUL SIGNUP ==========
    await logAudit({
      action: AuditAction.AUTH_SIGNUP,
      userId: user.id,
      resource: email,
      status: 'success',
      ipAddress: clientIp,
    });
    console.log('[AUTH] Signup successful for user:', user.email);

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

    const nextResponse = NextResponse.json(response, { status: 201 });

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
    console.error('[AUTH] Signup error:', err);
    return NextResponse.json(
      { error: 'server error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
