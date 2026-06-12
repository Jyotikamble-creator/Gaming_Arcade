/**
 * Audit Logging System
 * Tracks sensitive operations for security and compliance
 */

import { prisma } from '@/lib/api/prisma';

export enum AuditAction {
  AUTH_SIGNUP = 'AUTH_SIGNUP',
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_FAILED_LOGIN = 'AUTH_FAILED_LOGIN',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  FOLLOW_USER = 'FOLLOW_USER',
  UNFOLLOW_USER = 'UNFOLLOW_USER',
  SCORE_SUBMIT = 'SCORE_SUBMIT',
  ADMIN_ACTION = 'ADMIN_ACTION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
}

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// In-memory audit log (use database in production)
const auditLogs: AuditLogEntry[] = [];

/**
 * Log an audit entry
 */
export async function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  // Add to in-memory log
  auditLogs.push(logEntry);

  // Keep only last 10000 entries
  if (auditLogs.length > 10000) {
    auditLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', {
      action: entry.action,
      userId: entry.userId,
      status: entry.status,
      reason: entry.reason,
      timestamp: logEntry.timestamp.toISOString(),
    });
  }

  // TODO: In production, persist to database or external service
  // await persistAuditLog(logEntry);
}

/**
 * Get audit logs (with filtering)
 */
export function getAuditLogs(options?: {
  userId?: string;
  action?: AuditAction;
  status?: 'success' | 'failure';
  since?: Date;
  limit?: number;
}): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (options?.userId) {
    filtered = filtered.filter(log => log.userId === options.userId);
  }

  if (options?.action) {
    filtered = filtered.filter(log => log.action === options.action);
  }

  if (options?.status) {
    filtered = filtered.filter(log => log.status === options.status);
  }

  if (options?.since) {
    filtered = filtered.filter(log => log.timestamp >= options.since!);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Helper: Log authentication attempt
 */
export async function logAuthAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  reason?: string
): Promise<void> {
  await logAudit({
    action: success ? AuditAction.AUTH_LOGIN : AuditAction.AUTH_FAILED_LOGIN,
    resource: email,
    status: success ? 'success' : 'failure',
    reason: reason,
    ipAddress,
    userAgent,
  });
}

/**
 * Helper: Log profile change
 */
export async function logProfileChange(
  userId: string,
  changes: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.PROFILE_UPDATE,
    changes,
    status: 'success',
    ipAddress,
  });
}

/**
 * Helper: Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  reason: string,
  ipAddress?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.SUSPICIOUS_ACTIVITY,
    status: 'failure',
    reason,
    ipAddress,
    metadata,
  });
}

/**
 * Helper: Log API key event
 */
export async function logApiKeyEvent(
  userId: string,
  action: AuditAction.API_KEY_CREATED | AuditAction.API_KEY_REVOKED,
  keyId: string,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource: keyId,
    status: 'success',
    ipAddress,
  });
}

/**
 * Detect suspicious patterns (for anomaly detection)
 */
export function detectSuspiciousPatterns(userId: string): {
  suspicious: boolean;
  reason?: string;
} {
  const userLogs = getAuditLogs({ userId, limit: 100 });
  const recentLogs = userLogs.filter(
    log => log.timestamp.getTime() > Date.now() - 60 * 60 * 1000 // Last hour
  );

  // Flag: Many failed login attempts
  const failedAttempts = recentLogs.filter(
    log => log.action === AuditAction.AUTH_FAILED_LOGIN
  ).length;
  if (failedAttempts > 5) {
    return {
      suspicious: true,
      reason: `${failedAttempts} failed login attempts in the last hour`,
    };
  }

  // Flag: Multiple rapid requests
  const rapidRequests = recentLogs.length;
  if (rapidRequests > 50) {
    return {
      suspicious: true,
      reason: `${rapidRequests} actions in the last hour (possible bot)`,
    };
  }

  // Flag: Multiple follow/unfollow operations
  const followOps = recentLogs.filter(
    log => [AuditAction.FOLLOW_USER, AuditAction.UNFOLLOW_USER].includes(log.action)
  ).length;
  if (followOps > 20) {
    return {
      suspicious: true,
      reason: `${followOps} follow operations in the last hour`,
    };
  }

  return { suspicious: false };
}

/**
 * Clear audit logs (development/testing only)
 */
export function clearAuditLogs(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear audit logs in production');
  }
  auditLogs.length = 0;
}
