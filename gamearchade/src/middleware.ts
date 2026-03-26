import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSessionAuth } from '@/lib/auth/middleware';

/**
 * Next.js 16+ Middleware
 * Handles page-level authentication only
 * API route authentication is handled in route handlers using middleware helpers
 */

const PROTECTED_PAGES = [
  '/dashboard',
  '/pages/profile',
  '/pages/settings',
  '/pages/progress',
  '/pages/scores',
];

const AUTH_PAGE = '/pages/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect to auth page if user tries to access protected pages without session
  if (PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    const auth = requireSessionAuth(request);
    
    if (!auth.valid) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_PAGE;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure matcher for page routes only
// API routes should handle auth in their route handlers
export const config = {
  matcher: [
    '/dashboard',
    '/pages/:path*',
  ],
};
