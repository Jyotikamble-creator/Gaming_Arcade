/**
 * Authentication middleware helpers for API routes
 * Use these in your route handlers instead of file-based middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify Bearer token from Authorization header
 */
export function verifyBearerToken(request: NextRequest): { valid: boolean; token?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid Authorization header format' };
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  return { valid: true, token };
}

/**
 * Verify session token from cookies
 */
export function verifySessionToken(request: NextRequest): { valid: boolean; token?: string; error?: string } {
  const sessionToken = request.cookies.get('session-token')?.value;

  if (!sessionToken) {
    return { valid: false, error: 'Missing session token' };
  }

  return { valid: true, token: sessionToken };
}

/**
 * API route protection wrapper
 * Usage: 
 * ```
 * export async function GET(request: NextRequest) {
 *   const auth = requireBearerAuth(request);
 *   if (!auth.valid) return auth.response;
 *   // Your protected code here
 * }
 * ```
 */
export function requireBearerAuth(request: NextRequest) {
  const bearerAuth = verifyBearerToken(request);

  if (!bearerAuth.valid) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: bearerAuth.error || 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return {
    valid: true,
    token: bearerAuth.token,
    response: null,
  };
}

/**
 * Page protection wrapper
 * Usage in middleware or route handlers
 */
export function requireSessionAuth(request: NextRequest) {
  const sessionAuth = verifySessionToken(request);

  if (!sessionAuth.valid) {
    return {
      valid: false,
      error: sessionAuth.error,
    };
  }

  return {
    valid: true,
    token: sessionAuth.token,
  };
}
