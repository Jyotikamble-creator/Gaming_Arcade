// Follow repository — advanced follow-relationship utilities
import Follow from '@/models/common/Follow';
import User from '@/models/auth/auth';
import { connectDB } from '@/models/db';

/**
 * Check if userA follows userB.
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  await connectDB();
  const follow = await Follow.findOne({ follower: followerId, following: followingId });
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
  await connectDB();
  const follows = await Follow.find({
    follower: viewerId,
    following: { $in: userIds },
  }).select('following');
  return new Set(follows.map((f) => f.following.toString()));
}

/**
 * Get mutual followers between two users (follower IDs both follow the other).
 */
export async function getMutualFollowers(
  userIdA: string,
  userIdB: string
): Promise<string[]> {
  await connectDB();
  const [followersA, followersB] = await Promise.all([
    Follow.find({ following: userIdA }).select('follower'),
    Follow.find({ following: userIdB }).select('follower'),
  ]);
  const setA = new Set(followersA.map((f) => f.follower.toString()));
  return followersB
    .map((f) => f.follower.toString())
    .filter((id) => setA.has(id));
}

/**
 * Suggest users to follow — second-degree connections not already followed.
 */
export async function getFollowSuggestions(userId: string, limit = 5) {
  await connectDB();

  // IDs I already follow
  const myFollowing = await Follow.find({ follower: userId }).select('following');
  const followingIds = myFollowing.map((f) => f.following);

  // Second-degree: users followed by people I follow, excluding myself
  const secondDegree = await Follow.find({
    follower: { $in: followingIds },
    following: { $nin: [...followingIds, userId] },
  })
    .select('following')
    .limit(limit * 3);

  const candidateIds = [
    ...new Set(secondDegree.map((f) => f.following.toString())),
  ].slice(0, limit);

  return User.find({ _id: { $in: candidateIds } })
    .select('_id email displayName username avatar stats')
    .lean();
}

/**
 * Get recent follow activity for a user's feed
 * (follows made by people the user follows).
 */
export async function getFollowActivity(userId: string, limit = 20) {
  await connectDB();

  const myFollowing = await Follow.find({ follower: userId }).select('following');
  const followingIds = myFollowing.map((f) => f.following);

  return Follow.find({ follower: { $in: followingIds } })
    .populate('follower', 'displayName username avatar')
    .populate('following', 'displayName username avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
}
