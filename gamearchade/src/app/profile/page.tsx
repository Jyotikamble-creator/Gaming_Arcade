'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar?: string;
  totalScore: number;
  gamesPlayed: number;
  followers: number;
  following: number;
  joinDate: string;
  lastLogin: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        router.push('/pages/auth');
        return;
      }

      // Fetch user profile from API
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.user || {
        id: 'guest',
        username: 'Guest User',
        displayName: 'Guest',
        email: 'guest@example.com',
        bio: 'Welcome to GameArchade!',
        totalScore: 0,
        gamesPlayed: 0,
        followers: 0,
        following: 0,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-5xl font-bold text-white">My Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl mb-8"
        >
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.displayName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{profile.displayName}</h2>
              <p className="text-gray-400 text-lg mb-3">@{profile.username}</p>
              <p className="text-gray-300 mb-4 max-w-md">{profile.bio}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
                <button
                  onClick={() => router.push('/pages/settings')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm font-semibold mb-2">Total Score</div>
              <div className="text-3xl font-bold text-yellow-400">{profile.totalScore.toLocaleString()}</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm font-semibold mb-2">Games Played</div>
              <div className="text-3xl font-bold text-blue-400">{profile.gamesPlayed}</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm font-semibold mb-2">Followers</div>
              <div className="text-3xl font-bold text-green-400">{profile.followers}</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm font-semibold mb-2">Following</div>
              <div className="text-3xl font-bold text-pink-400">{profile.following}</div>
            </div>
          </div>
        </motion.div>

        {/* Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Account Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Email</span>
              <span className="text-white font-medium">{profile.email}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white font-medium">
                {new Date(profile.joinDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Last Login</span>
              <span className="text-white font-medium">
                {new Date(profile.lastLogin).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-700/50 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h3>
          
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
              Change Password
            </button>
            
            <button className="w-full px-4 py-3 bg-red-800 hover:bg-red-900 text-red-200 rounded-lg font-semibold transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
