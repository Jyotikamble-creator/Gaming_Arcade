"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  className = '',
  onFollowChange,
}: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // Don't render for own profile or unauthenticated users
  if (!isAuthenticated || user?.id === targetUserId) return null;

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (isFollowing) {
        const res = await fetch('/api/follows', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ followingId: targetUserId }),
        });
        if (res.ok) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers,
          body: JSON.stringify({ followingId: targetUserId }),
        });
        if (res.ok) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (err) {
      console.error('[FollowButton] toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isFollowing
            ? 'bg-gray-700 text-white hover:bg-red-600 focus:ring-red-500'
            : 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500'
        } ${className}`}
    >
      {loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
