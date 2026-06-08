// Follow repository — advanced follow-relationship utilities using Prisma Client
import { prisma } from '@/lib/api/prisma';

/**
 * Check if userA follows userB.
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });
  return !!follow;
}

/**
 * Bulk check: given a viewer and a list of user IDs,
 * return the set of IDs that the viewer already follows.
 */
export async function bulkIsFollowing(
  viewerId: string,
  userIds: string[]
): Promise<Set<string>> {
  const follows = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      followingId: { in: userIds },
    },
    select: { followingId: true }
  });
  return new Set(follows.map((f) => f.followingId));
}

/**
 * Get mutual followers between two users (follower IDs both follow the other).
 */
export async function getMutualFollowers(
  userIdA: string,
  userIdB: string
): Promise<string[]> {
  const [followersA, followersB] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userIdA },
      select: { followerId: true }
    }),
    prisma.follow.findMany({
      where: { followingId: userIdB },
      select: { followerId: true }
    }),
  ]);
  const setA = new Set(followersA.map((f) => f.followerId));
  return followersB
    .map((f) => f.followerId)
    .filter((id) => setA.has(id));
}

/**
 * Suggest users to follow — second-degree connections not already followed.
 */
export async function getFollowSuggestions(userId: string, limit = 5) {
  // IDs I already follow
  const myFollowing = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = myFollowing.map((f) => f.followingId);

  // Second-degree: users followed by people I follow, excluding myself and those I already follow
  const secondDegree = await prisma.follow.findMany({
    where: {
      followerId: { in: followingIds },
      followingId: { notIn: [...followingIds, userId] },
    },
    select: { followingId: true },
    take: limit * 3
  });

  const candidateIds = [
    ...new Set(secondDegree.map((f) => f.followingId)),
  ].slice(0, limit);

  return prisma.user.findMany({
    where: { id: { in: candidateIds } },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      avatar: true,
      stats: true,
    }
  });
}

/**
 * Get recent follow activity for a user's feed
 * (follows made by people the user follows).
 */
export async function getFollowActivity(userId: string, limit = 20) {
  const myFollowing = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = myFollowing.map((f) => f.followingId);

  return prisma.follow.findMany({
    where: { followerId: { in: followingIds } },
    include: {
      follower: {
        select: {
          displayName: true,
          username: true,
          avatar: true,
        }
      },
      following: {
        select: {
          displayName: true,
          username: true,
          avatar: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
