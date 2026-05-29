/**
 * CSRF Protection Utility
 * Prevents Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// In-memory token store (use Redis in production)
const csrfTokens = new Map<string, { token: string; createdAt: number; used: boolean }>();

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create unique identifier from IP + User Agent
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create CSRF token for client
 */
export function createCsrfToken(request: NextRequest): string {
  const clientId = getClientIdentifier(request);
  const token = generateCsrfToken();
  const now = Date.now();

  // Clean up expired tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.createdAt > TOKEN_EXPIRY) {
      csrfTokens.delete(key);
    }
  }

  // Store token
  csrfTokens.set(clientId, { token, createdAt: now, used: false });

  return token;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(request: NextRequest, token: string): boolean {
  const clientId = getClientIdentifier(request);
  const record = csrfTokens.get(clientId);

  if (!record) {
    console.warn('[CSRF] No token found for client:', clientId);
    return false;
  }

  const now = Date.now();
  const isExpired = now - record.createdAt > TOKEN_EXPIRY;

  if (isExpired) {
    csrfTokens.delete(clientId);
    console.warn('[CSRF] Token expired for client:', clientId);
    return false;
  }

  if (record.used) {
    console.warn('[CSRF] Token already used for client:', clientId);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(token);
  const storedBuffer = Buffer.from(record.token);

  const isValid = crypto.timingSafeEqual(tokenBuffer, storedBuffer);

  if (isValid) {
    // Mark token as used (single-use)
    record.used = true;
  }

  return isValid;
}

/**
 * Middleware to check CSRF token for state-changing requests
 */
export async function checkCsrfToken(
  request: NextRequest
): Promise<{ valid: boolean; response?: NextResponse }> {
  const method = request.method;

  // Only check for state-changing requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true };
  }

  // Get token from headers or body
  const headerToken = request.headers.get('x-csrf-token');
  const bodyToken = await getBodyToken(request);
  const token = headerToken || bodyToken;

  if (!token) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'CSRF token required' },
        { status: 403 }
      ),
    };
  }

  const valid = verifyCsrfToken(request, token);

  if (!valid) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Extract token from request body (for JSON requests)
 */
async function getBodyToken(request: NextRequest): Promise<string | null> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return null;
    }

    const body = await request.json();
    return body._csrf || null;
  } catch {
    return null;
  }
}

/**
 * Add CSRF token to response headers
 */
export function addCsrfTokenToResponse(
  response: NextResponse,
  token: string
): NextResponse {
  response.headers.set('X-CSRF-Token', token);
  return response;
}
