"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored session
        const storedUser = localStorage.getItem('gamearchade_user');
        const storedToken = localStorage.getItem('gamearchade_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          
          // In a real app, verify the token with your backend here
          // For demo, we'll trust the stored data
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('gamearchade_user');
        localStorage.removeItem('gamearchade_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Mock API call - replace with real implementation
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (email === 'demo@gamearchade.com' && password === 'password') {
        const userData: User = {
          id: '1',
          name: 'Demo Player',
          email: email,
          displayName: 'Demo Player',
          createdAt: new Date()
        };
        
        // Store user data
        localStorage.setItem('gamearchade_user', JSON.stringify(userData));
        localStorage.setItem('gamearchade_token', 'demo-jwt-token');
        
        setUser(userData);
        return { success: true };
      } else {
        // For demo, accept any email/password combo
        const userData: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
          displayName: email.split('@')[0],
          createdAt: new Date()
        };
        
        localStorage.setItem('gamearchade_user', JSON.stringify(userData));
        localStorage.setItem('gamearchade_token', 'demo-jwt-token');
        
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists (mock check)
      const existingUser = localStorage.getItem(`user_${email}`);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists.'
        };
      }
      
      const userData: User = {
        id: Date.now().toString(),
        name: name,
        email: email,
        displayName: name,
        createdAt: new Date()
      };
      
      // Store user data
      localStorage.setItem('gamearchade_user', JSON.stringify(userData));
      localStorage.setItem('gamearchade_token', 'demo-jwt-token');
      localStorage.setItem(`user_${email}`, 'registered'); // Track registered emails
      
      setUser(userData);
      return { success: true };
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: 'Signup failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gamearchade_user');
    localStorage.removeItem('gamearchade_token');
    setUser(null);
    router.push('/');
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    localStorage.setItem('gamearchade_user', JSON.stringify(updatedUser));
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}