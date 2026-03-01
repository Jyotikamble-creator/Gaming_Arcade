"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MusicTiles() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth if not authenticated after loading completes
    if (!loading && !isAuthenticated) {
      router.push("/pages/auth");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render page if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-5xl font-bold text-white mb-2">🎵 Music Tiles</h1>
          <p className="text-white/70 text-lg">
            Tap the tiles in rhythm to the music
          </p>
        </div>

        {/* Game Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 text-center shadow-2xl">
          <div className="text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">🎮 Coming Soon!</h2>
            <p className="text-white/80 mb-4">
              Music Tiles is currently under development. This rhythm-based game will challenge your timing and musical skills!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎯 Game Features:</h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Multiple difficulty levels</li>
                  <li>• Various music genres</li>
                  <li>• Combo multipliers</li>
                  <li>• Perfect timing bonuses</li>
                </ul>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🏆 Scoring System:</h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Accuracy-based scoring</li>
                  <li>• Streak bonuses</li>
                  <li>• Global leaderboards</li>
                  <li>• Achievement system</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Placeholder Game Area */}
          <div className="bg-black/30 rounded-xl p-12 mb-6 border-2 border-dashed border-white/20">
            <div className="text-6xl mb-4">🎹</div>
            <p className="text-white/50 text-lg">Game Area - In Development</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
            >
              Back to Dashboard
            </button>
            <button
              disabled
              className="bg-gray-600 text-white/50 font-bold py-3 px-8 rounded-lg shadow-lg cursor-not-allowed"
            >
              Start Game (Coming Soon)
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-center text-white/60 text-sm">
            Playing as: <span className="text-white font-semibold">{user.name || user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
