/**
 * Request Validation Schemas using Zod
 * Ensures all API requests have valid data
 */

import { z } from 'zod';

// ========== AUTH SCHEMAS ==========

export const SignupRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().optional().transform(v => v?.trim()),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password required'),
});

export const ProfileUpdateSchema = z.object({
  displayName: z.string().max(50, 'Display name must be under 50 characters').optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _, -').optional(),
  favoriteGame: z.string().max(50).optional(),
});

// ========== SCORE SCHEMAS ==========

export const SubmitScoreSchema = z.object({
  game: z.string().min(1, 'Game ID required').max(50),
  score: z.number().int().min(0, 'Score cannot be negative').max(999999999),
  playerName: z.string().max(100).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const ScoresQuerySchema = z.object({
  game: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  userId: z.string().optional(),
});

// ========== FOLLOW SCHEMAS ==========

export const FollowRequestSchema = z.object({
  followingId: z.string().min(1, 'User ID required'),
});

export const FollowQuerySchema = z.object({
  type: z.enum(['followers', 'following']).optional(),
  userId: z.string().min(1, 'User ID required'),
});

// ========== GAME SCHEMAS ==========

export const GameActionSchema = z.object({
  gameType: z.string().min(1),
  action: z.enum(['start', 'submit', 'hint', 'complete']),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const WordQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'master']).optional(),
  language: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// ========== VALIDATION HELPER ==========

/**
 * Validate request data against schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ valid: boolean; data?: T; error?: string }> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return {
        valid: false,
        error: `Validation error: ${messages}`,
      };
    }

    return { valid: true, data: validation.data };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid request body',
    };
  }
}

/**
 * Type extraction from Zod schemas
 */
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type SubmitScore = z.infer<typeof SubmitScoreSchema>;
export type FollowRequest = z.infer<typeof FollowRequestSchema>;
export type WordQuery = z.infer<typeof WordQuerySchema>;
