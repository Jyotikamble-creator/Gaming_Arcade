/**
 * API Key Management System
 * For securing sensitive endpoints and third-party integrations
 */

import crypto from 'crypto';

export interface ApiKey {
  id: string;
  key: string; // Hashed key
  name: string;
  userId: string;
  scopes: string[]; // Permissions: ['read', 'write', 'admin', etc.]
  rateLimit?: number; // Requests per minute
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

// In-memory API key store (use database in production)
const apiKeys = new Map<string, ApiKey>();

/**
 * Generate a new API key
 */
export function generateApiKey(): { keyId: string; secretKey: string } {
  const keyId = crypto.randomBytes(8).toString('hex');
  const secretKey = crypto.randomBytes(32).toString('hex');
  return { keyId, secretKey };
}

/**
 * Create API key hash for storage
 */
function hashApiKey(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Create new API key for user
 */
export function createApiKey(
  userId: string,
  name: string,
  scopes: string[] = ['read'],
  expiresAt?: Date
): { keyId: string; secretKey: string } {
  const { keyId, secretKey } = generateApiKey();
  const hashedKey = hashApiKey(secretKey);

  const apiKey: ApiKey = {
    id: keyId,
    key: hashedKey,
    name,
    userId,
    scopes,
    expiresAt,
    createdAt: new Date(),
    isActive: true,
  };

  apiKeys.set(keyId, apiKey);
  console.log(`[API_KEY] Created new key: ${keyId} for user: ${userId}`);

  return { keyId, secretKey };
}

/**
 * Verify API key
 */
export function verifyApiKey(
  keyId: string,
  secretKey: string
): { valid: boolean; apiKey?: ApiKey; error?: string } {
  const apiKey = apiKeys.get(keyId);

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: 'API key is inactive' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Verify key with constant-time comparison
  const hashedSecret = hashApiKey(secretKey);
  const secretBuffer = Buffer.from(hashedSecret);
  const storedBuffer = Buffer.from(apiKey.key);

  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(secretBuffer, storedBuffer);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return { valid: false, error: 'Invalid API key secret' };
  }

  // Update last used time
  apiKey.lastUsedAt = new Date();

  return { valid: true, apiKey };
}

/**
 * Check if API key has required scope
 */
export function hasScope(apiKey: ApiKey, requiredScope: string): boolean {
  return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');
}

/**
 * Revoke API key
 */
export function revokeApiKey(keyId: string): boolean {
  const apiKey = apiKeys.get(keyId);
  if (!apiKey) {
    return false;
  }
  apiKey.isActive = false;
  console.log(`[API_KEY] Revoked key: ${keyId}`);
  return true;
}

/**
 * Get API keys for user
 */
export function getUserApiKeys(userId: string): Omit<ApiKey, 'key'>[] {
  const userKeys = Array.from(apiKeys.values())
    .filter(key => key.userId === userId)
    .map(({ key, ...rest }) => rest);

  return userKeys;
}

/**
 * Delete API key
 */
export function deleteApiKey(keyId: string, userId: string): boolean {
  const apiKey = apiKeys.get(keyId);
  if (!apiKey || apiKey.userId !== userId) {
    return false;
  }
  apiKeys.delete(keyId);
  console.log(`[API_KEY] Deleted key: ${keyId}`);
  return true;
}

/**
 * Get available scopes
 */
export const API_SCOPES = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  ALL: '*',
};

/**
 * Rotate API key (generate new, keep old temporarily)
 */
export function rotateApiKey(keyId: string): { newKeyId: string; newSecretKey: string } | null {
  const oldKey = apiKeys.get(keyId);
  if (!oldKey) {
    return null;
  }

  const { keyId: newKeyId, secretKey: newSecretKey } = createApiKey(
    oldKey.userId,
    `${oldKey.name} (rotated)`,
    oldKey.scopes,
    oldKey.expiresAt
  );

  // Keep old key active for 24 hours for migration
  const deactivateTime = new Date();
  deactivateTime.setHours(deactivateTime.getHours() + 24);
  oldKey.isActive = false;

  console.log(`[API_KEY] Rotated key: ${keyId} → ${newKeyId}`);

  return { newKeyId, newSecretKey };
}
