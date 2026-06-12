/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and DoS attacks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

/**
 * Check rate limit for a client
 */
export function checkRateLimit(ip: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  // Initialize or reset if window has passed
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  record.count++;
  return { allowed: true };
}

/**
 * Rate limiting middleware for Next.js
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip, config);

  if (!allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }
    return { allowed: false, response };
  }

  return { allowed: true };
}

/**
 * Predefined rate limit configs
 */
export const RATE_LIMIT_CONFIG = {
  // Auth endpoints: 5 requests per 15 minutes per IP
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  } as RateLimitConfig,

  // API endpoints: 100 requests per 1 minute per IP
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100,
  } as RateLimitConfig,

  // Sensitive endpoints: 10 requests per 1 hour per IP
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  } as RateLimitConfig,

  // Follow/social endpoints: 30 requests per 1 minute per IP
  social: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
  } as RateLimitConfig,

  // Score submission: 20 requests per 1 minute per IP
  scores: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
  } as RateLimitConfig,
};
