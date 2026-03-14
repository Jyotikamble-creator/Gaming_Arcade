import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Page-level routes that require authentication (checked via HttpOnly session cookie)
const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/pages/profile',
  '/pages/progress',
  '/pages/scores',
];

// API routes that require a Bearer token
const PROTECTED_API_PREFIXES = [
  '/api/auth/me',
  '/api/auth/profile',
  '/api/auth/user-stats',
  '/api/follows',
];

const AUTH_PAGE = '/pages/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protected API routes: require Authorization: Bearer <token> ──────────
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── Protected page routes: require session-token cookie ──────────────────
  if (PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p))) {
    const sessionToken = request.cookies.get('session-token')?.value;
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_PAGE;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pages/profile/:path*',
    '/pages/progress/:path*',
    '/pages/scores/:path*',
    '/api/auth/me',
    '/api/auth/profile',
    '/api/auth/user-stats',
    '/api/follows/:path*',
  ],
};
