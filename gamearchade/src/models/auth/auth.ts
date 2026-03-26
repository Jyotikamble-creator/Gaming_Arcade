/**
 * PostgreSQL User model using Prisma
 * Provides database operations for user management
 */

import { prisma } from '@/lib/mongodb';
import type { User, UserStats } from '@prisma/client';

export interface IUser extends User {}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  username?: string;
  displayName?: string;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      username: data.username || undefined,
      displayName: data.displayName || '',
    },
  });
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { stats: true },
  });
}

/**
 * Find user by ID
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { stats: true },
  });
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: { stats: true },
  });
}

/**
 * Update user profile
 */
export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) {
  return prisma.user.update({
    where: { id },
    data,
    include: { stats: true },
  });
}

/**
 * Delete user (and cascade delete their data)
 */
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

/**
 * Get user leaderboard stats
 */
export async function getUsersLeaderboard(limit: number = 10) {
  return prisma.user.findMany({
    take: limit,
    orderBy: {
      stats: {
        totalScore: 'desc',
      },
    },
    include: { stats: true },
  });
}

/**
 * Initialize user stats
 */
export async function initializeUserStats(userId: string) {
  return prisma.userStats.create({
    data: {
      userId,
      followerCount: 0,
      followingCount: 0,
      totalScore: 0,
      gamesPlayed: 0,
    },
  });
}

// Default export for backwards compatibility
export default {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUser,
  deleteUser,
  getUsersLeaderboard,
  initializeUserStats,
};
