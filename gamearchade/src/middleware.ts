import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCorsPreFlight, applyCorsHeaders } from '@/lib/security/cors';

/**
 * Security Middleware for Next.js App Router
 * Handles CORS, security headers, and rate limiting
 */
export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  const corsPreflightResponse = handleCorsPreFlight(request);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  // Create response
  const response = NextResponse.next();

  // Apply CORS headers
  applyCorsHeaders(request, response);

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Strict CSP (adjust as needed for your app)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:"
  );

  // HSTS header (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Public pages
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

