/**
 * CORS Configuration
 * Restricts cross-origin requests to trusted domains
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed origins for CORS
 * Update these based on your deployment environment
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  // Production domains
  process.env.NEXT_PUBLIC_API_URL,
  // Add more trusted domains as needed
].filter(Boolean);

/**
 * CORS headers
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://gamearchade.com', // Set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-API-Key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '3600',
  'Access-Control-Expose-Headers': 'X-CSRF-Token, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After',
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // Allow localhost in development
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true;
  }

  return ALLOWED_ORIGINS.some(allowed => {
    if (!allowed) return false;
    return origin === allowed || origin.endsWith(allowed);
  });
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  if (isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
    response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);
    response.headers.set('Access-Control-Allow-Credentials', CORS_HEADERS['Access-Control-Allow-Credentials']);
    response.headers.set('Access-Control-Expose-Headers', CORS_HEADERS['Access-Control-Expose-Headers']);
  } else if (origin) {
    console.warn('[CORS] Request from disallowed origin:', origin);
  }

  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('origin');
  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin!,
      'Access-Control-Allow-Methods': CORS_HEADERS['Access-Control-Allow-Methods'],
      'Access-Control-Allow-Headers': CORS_HEADERS['Access-Control-Allow-Headers'],
      'Access-Control-Allow-Credentials': CORS_HEADERS['Access-Control-Allow-Credentials'],
      'Access-Control-Max-Age': CORS_HEADERS['Access-Control-Max-Age'],
    },
  });
}
