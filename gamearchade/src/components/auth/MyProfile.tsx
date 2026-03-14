"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { User } from '@/lib/auth/AuthProvider';

interface FormData {
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  favoriteGame: string;
}

interface Game {
  id: string;
  name: string;
  icon: string;
}

const GAMES: Game[] = [
  { id: 'word-guess', name: 'Word Guess', icon: '🔤' },
  { id: 'memory-card', name: 'Memory Card', icon: '🧠' },
  { id: 'math-quiz', name: 'Math Quiz', icon: '🧮' },
  { id: 'typing-test', name: 'Typing Test', icon: '⌨️' },
  { id: 'emoji-guess', name: 'Emoji Guess', icon: '😀' },
  { id: 'simon-says', name: 'Simon Says', icon: '🎯' },
  { id: 'whack-mole', name: 'Whack a Mole', icon: '🐭' },
  { id: 'word-scramble', name: 'Word Scramble', icon: '🔀' },
  { id: 'quiz', name: 'Quiz', icon: '📝' },
  { id: 'brain-teaser', name: 'Brain Teaser', icon: '🧩' },
  { id: 'coding-puzzle', name: 'Coding Puzzle', icon: '💻' },
  { id: 'hangman', name: 'Hangman', icon: '🪢' },
  { id: 'number-maze', name: 'Number Maze', icon: '🔢' },
  { id: 'speed-math', name: 'Speed Math', icon: '⚡' },
  { id: 'sudoku', name: 'Sudoku', icon: '🔲' },
  { id: 'word-builder', name: 'Word Builder', icon: '🏗️' },
  { id: 'game-2048', name: '2048', icon: '🎲' },
  { id: 'sliding-puzzle', name: 'Sliding Puzzle', icon: '🧩' },
  { id: 'reaction-time', name: 'Reaction Time', icon: '⚡' },
  { id: 'tower-stacker', name: 'Tower Stacker', icon: '🏗️' },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '✖️' },
];

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function buildFormData(u: User | null): FormData {
  return {
    displayName: u?.displayName ?? '',
    username: u?.username ?? '',
    bio: u?.bio ?? '',
    avatar: u?.avatar ?? '',
    favoriteGame: u?.favoriteGame ?? '',
  };
}

function calcCompletion(source: FormData): number {
  const fields = [
    source.displayName,
    source.username,
    source.bio,
    source.favoriteGame,
  ];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export default function MyProfile() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, updateProfile } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(buildFormData(null));

  // Load fresh user data from /api/auth/me on mount
  useEffect(() => {
    if (authLoading) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setError('Please log in to view your profile.');
      router.replace('/pages/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.replace('/pages/auth');
            return;
          }
          throw new Error('Failed to load profile');
        }

        const data = await res.json();
        const u: User = {
          id: data.user.id ?? data.user._id,
          email: data.user.email,
          name: data.user.displayName || data.user.username || data.user.email.split('@')[0],
          displayName: data.user.displayName,
          username: data.user.username,
          bio: data.user.bio,
          avatar: data.user.avatar,
          favoriteGame: data.user.favoriteGame,
          profileCompleted: data.user.profileCompleted,
          role: data.user.role,
          stats: data.user.stats ?? {
            followerCount: 0,
            followingCount: 0,
            totalScore: 0,
            gamesPlayed: 0,
          },
          createdAt: data.user.createdAt,
        };
        setUser(u);
        setFormData(buildFormData(u));
      } catch {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, router]);

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token || !user) return;

    try {
      setSaving(true);
      setError(null);

      const body = {
        displayName: formData.displayName || undefined,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        avatar: formData.avatar || undefined,
        favoriteGame: formData.favoriteGame || undefined,
      };

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/pages/auth');
          return;
        }
        setError(data.error || 'Failed to save profile. Please try again.');
        return;
      }

      const updated: User = {
        ...user,
        displayName: data.user.displayName,
        username: data.user.username,
        bio: data.user.bio,
        avatar: data.user.avatar,
        favoriteGame: data.user.favoriteGame,
        name: data.user.displayName || data.user.username || user.name,
      };

      setUser(updated);
      setFormData(buildFormData(updated));
      // Sync auth context so Sidebar/header reflect the changes
      await updateProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Profile saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(buildFormData(user));
    setIsEditing(false);
    setError(null);
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ─── Not authenticated ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Not Signed In</h2>
          <p className="text-white/60 mb-6">Please sign in to view your profile</p>
          <button
            onClick={() => router.push('/pages/auth')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const completionPct = calcCompletion(isEditing ? formData : buildFormData(user));
  const savedPct = calcCompletion(buildFormData(user));
  const favoriteGame = GAMES.find((g) => g.id === user.favoriteGame);
  const joinedYear = user.createdAt ? new Date(user.createdAt).getFullYear() : '—';
  const joinedFull = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            👤 My Profile
          </h1>
          <p className="text-white/60 text-lg">Manage your gaming profile and preferences</p>
        </motion.div>

        {/* Success message */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-center font-medium"
          >
            ✓ {successMsg}
          </motion.div>
        )}

        {/* Stats row */}
        {user.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Followers', value: user.stats.followerCount, color: 'text-blue-400' },
              { label: 'Following', value: user.stats.followingCount, color: 'text-purple-400' },
              { label: 'Total Score', value: user.stats.totalScore, color: 'text-yellow-400' },
              { label: 'Games Played', value: user.stats.gamesPlayed, color: 'text-green-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center"
              >
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-white/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Profile Completion</h3>
            <div className="flex items-center gap-2">
              {isEditing && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                  Preview
                </span>
              )}
              <span className="text-sm font-medium text-blue-400">{completionPct}%</span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isEditing
                  ? 'bg-linear-to-r from-yellow-500 to-orange-500'
                  : 'bg-linear-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-white/50 text-sm">
            {isEditing
              ? 'Preview shows completion after saving. Fill in all fields to reach 100%!'
              : 'Complete your profile to unlock achievements!'}
          </p>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">

            {/* Avatar + Name row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
              <div className="flex items-center gap-5">
                {/* Avatar circle */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {getInitials(
                      isEditing ? (formData.displayName || user.email) : (user.displayName || user.email)
                    )}
                  </div>
                  {savedPct === 100 && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-purple-900">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name / username */}
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Display Name"
                      maxLength={50}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                    />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Username"
                      maxLength={30}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user.displayName || 'Anonymous Player'}
                    </h2>
                    <p className="text-white/50">@{user.username || 'guest'}</p>
                    <p className="text-white/40 text-sm mt-0.5">Member since {joinedFull}</p>
                  </div>
                )}
              </div>

              {/* Edit / Save / Cancel buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                  {error.toLowerCase().includes('network') && (
                    <button
                      onClick={() => {
                        setError(null);
                        if (isEditing) handleSave();
                      }}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Bio + Favorite Game */}
              <div className="space-y-6">

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Bio</label>
                  {isEditing ? (
                    <>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell other players about yourself…"
                        rows={4}
                        maxLength={500}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <p className="text-xs text-white/40 mt-1">{formData.bio.length}/500</p>
                    </>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[90px]">
                      <p className="text-white/80">
                        {user.bio || 'No bio yet. Tell other players about yourself!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Favorite Game */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Favorite Game</label>
                  {isEditing ? (
                    <select
                      value={formData.favoriteGame}
                      onChange={(e) => handleInputChange('favoriteGame', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="" className="bg-gray-900">Select your favorite game</option>
                      {GAMES.map((game) => (
                        <option key={game.id} value={game.id} className="bg-gray-900">
                          {game.icon} {game.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {favoriteGame ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{favoriteGame.icon}</span>
                          <span className="text-white font-medium">{favoriteGame.name}</span>
                        </div>
                      ) : (
                        <p className="text-white/40">No favorite game selected</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Account Info + Quick Stats */}
              <div className="space-y-6">

                {/* Account Info */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Account Information</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Email</span>
                      <span className="text-white text-sm font-medium truncate ml-4 max-w-[200px]">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Member since</span>
                      <span className="text-white text-sm font-medium">{joinedFull}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Role</span>
                      <span className={`text-sm font-medium capitalize px-2 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-blue-400/20 text-blue-400'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Status</span>
                      <span className={`text-sm font-medium ${
                        savedPct === 100 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {savedPct === 100 ? '✓ Complete' : `${savedPct}% Complete`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Quick Stats</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{savedPct}%</p>
                      <p className="text-xs text-white/40 mt-1">Profile Complete</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{joinedYear}</p>
                      <p className="text-xs text-white/40 mt-1">Joined</p>
                    </div>
                    {user.stats && (
                      <>
                        <div>
                          <p className="text-2xl font-bold text-yellow-400">{user.stats.totalScore}</p>
                          <p className="text-xs text-white/40 mt-1">Total Score</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-400">{user.stats.gamesPlayed}</p>
                          <p className="text-xs text-white/40 mt-1">Games Played</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
