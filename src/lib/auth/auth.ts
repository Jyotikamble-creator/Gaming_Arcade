// Authentication utility functions
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JWTPayload } from '@/types/auth/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// Type assertion: we've ensured JWT_SECRET exists above
const SECURE_JWT_SECRET: string = JWT_SECRET;

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { id: userId, email },
    SECURE_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, SECURE_JWT_SECRET) as Record<string, unknown>;
    return {
      id: decoded.id as string,
      email: decoded.email as string,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

/**
 * Get user ID from request token
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const token = extractToken(request);
    if (!token) return null;
    
    const decoded = verifyToken(token);
    return decoded.id;
  } catch (error) {
    return null;
  }
}
