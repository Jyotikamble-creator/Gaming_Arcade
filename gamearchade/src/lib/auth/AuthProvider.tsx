"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  favoriteGame?: string;
  profileCompleted?: boolean;
  role?: string;
  stats?: {
    followerCount: number;
    followingCount: number;
    totalScore: number;
    gamesPlayed: number;
  };
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

function mapApiUser(u: any, fallbackName?: string): User {
  return {
    id: u.id ?? u._id?.toString(),
    email: u.email,
    name: u.displayName || u.username || fallbackName || u.email.split('@')[0],
    displayName: u.displayName,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio,
    favoriteGame: u.favoriteGame,
    profileCompleted: u.profileCompleted,
    role: u.role,
    stats: u.stats ?? { followerCount: 0, followingCount: 0, totalScore: 0, gamesPlayed: 0 },
    createdAt: u.createdAt,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — validate stored token with /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          const userData = mapApiUser(data.user);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token expired or invalid — clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('[AUTH] Initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const { token } = data;
      localStorage.setItem('token', token);

      // Fetch full user profile
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = meRes.ok ? await meRes.json() : null;
      const userData = mapApiUser(meData?.user ?? data.user, email.split('@')[0]);

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('[AUTH] Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      const { token } = data;
      localStorage.setItem('token', token);

      // Set display name if provided
      if (name) {
        try {
          await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ displayName: name }),
          });
        } catch { /* non-critical */ }
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name,
        displayName: name,
        stats: { followerCount: 0, followingCount: 0, totalScore: 0, gamesPlayed: 0 },
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('[AUTH] Signup error:', err);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear server-side session cookie first so middleware sees logged-out state.
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (err) {
      console.error('[AUTH] Logout API error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const responseData = await res.json();
        const updatedUser = { ...user, ...mapApiUser(responseData.user, user.name) };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('[AUTH] Profile update error:', err);
      // Optimistic local update as fallback
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
