/**
 * PostgreSQL Follow model using Prisma
 * Tracks follow relationships between users for social features
 */

import { prisma } from '@/lib/mongodb';
import type { Follow } from '@prisma/client';

export interface IFollow extends Follow {}

/**
 * Create a follow relationship
 */
export async function createFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  return prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
    include: {
      follower: true,
      following: true,
    },
  });
}

/**
 * Remove a follow relationship
 */
export async function removeFollow(followerId: string, followingId: string) {
  return prisma.follow.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });
}

/**
 * Check if user follows another user
 */
export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  return !!follow;
}

/**
 * Get user's followers
 */
export async function getFollowers(userId: string, limit: number = 10) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string, limit: number = 10) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get follower count
 */
export async function getFollowerCount(userId: string) {
  return prisma.follow.count({
    where: { followingId: userId },
  });
}

/**
 * Get following count
 */
export async function getFollowingCount(userId: string) {
  return prisma.follow.count({
    where: { followerId: userId },
  });
}

// Default export for backwards compatibility
export default {
  createFollow,
  removeFollow,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowerCount,
  getFollowingCount,
};

