"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Simulate network delay / mock API
      await new Promise((res) => setTimeout(res, 800));

      const userData: User = {
        id: email === 'demo@gamearchade.com' ? '1' : Date.now().toString(),
        name: email.split('@')[0],
        email,
        displayName: email.split('@')[0],
        createdAt: new Date()
      };

      // Persist using the keys expected by the API client
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'demo-jwt-token');

      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      await new Promise((res) => setTimeout(res, 800));

      const userData: User = {
        id: Date.now().toString(),
        name,
        email,
        displayName: name,
        createdAt: new Date()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'demo-jwt-token');
      localStorage.setItem(`user_${email}`, 'registered');

      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
