
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Next.js App Router
 * Authentication checks are handled client-side via useAuth hook
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

