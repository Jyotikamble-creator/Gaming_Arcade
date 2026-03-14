"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell, Volume2, Shield, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';

interface LocalPreferences {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFS: LocalPreferences = {
  soundEnabled: true,
  notificationsEnabled: true,
  compactMode: false,
};

const PREF_KEY = 'gamearchade:settings';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateProfile, logout } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGame, setFavoriteGame] = useState('');

  const [prefs, setPrefs] = useState<LocalPreferences>(DEFAULT_PREFS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/pages/auth');
      return;
    }

    if (user) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setFavoriteGame(user.favoriteGame || '');
    }

    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalPreferences;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {
      setPrefs(DEFAULT_PREFS);
    }
  }, [loading, isAuthenticated, router, user]);

  const clearMessageLater = () => {
    window.setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 2500);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        displayName,
        username,
        bio,
        favoriteGame,
      });
      setSuccess('Profile settings saved successfully.');
      clearMessageLater();
    } catch {
      setError('Failed to save profile settings. Please try again.');
      clearMessageLater();
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    setError(null);
    setSuccess(null);

    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
      setSuccess('App preferences saved locally.');
      clearMessageLater();
    } catch {
      setError('Failed to save app preferences.');
      clearMessageLater();
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleResetPreferences = () => {
    setPrefs(DEFAULT_PREFS);
    localStorage.setItem(PREF_KEY, JSON.stringify(DEFAULT_PREFS));
    setSuccess('Preferences reset to defaults.');
    clearMessageLater();
  };

  const handleSignOutEverywhere = async () => {
    await logout();
    router.replace('/pages/auth');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-white/60 mt-2">Manage your account and game preferences.</p>
        </motion.div>

        {(success || error) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              success
                ? 'bg-green-500/20 border-green-400/30 text-green-200'
                : 'bg-red-500/20 border-red-400/30 text-red-200'
            }`}
          >
            {success || error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-300" /> Account Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Email</label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Favorite Game</label>
                <input
                  type="text"
                  value={favoriteGame}
                  onChange={(e) => setFavoriteGame(e.target.value)}
                  placeholder="e.g. word-guess"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {savingProfile ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Account Changes
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-300" /> App Preferences
            </h2>

            <div className="space-y-5">
              <label className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-3 border border-white/10">
                <span className="inline-flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-yellow-300" /> Sound Effects
                </span>
                <input
                  type="checkbox"
                  checked={prefs.soundEnabled}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-3 border border-white/10">
                <span>In-app Notifications</span>
                <input
                  type="checkbox"
                  checked={prefs.notificationsEnabled}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, notificationsEnabled: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-3 border border-white/10">
                <span>Compact Mode</span>
                <input
                  type="checkbox"
                  checked={prefs.compactMode}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, compactMode: e.target.checked }))}
                  className="h-4 w-4"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={savingPrefs}
                  onClick={handleSavePreferences}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
                >
                  {savingPrefs ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Preferences
                </button>

                <button
                  type="button"
                  onClick={handleResetPreferences}
                  className="px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-3 text-red-300">Danger Zone</h3>
              <button
                type="button"
                onClick={handleSignOutEverywhere}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Sign Out
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
