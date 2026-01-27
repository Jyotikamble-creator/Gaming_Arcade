'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Mock authentication for now
    // In a real app, you would check localStorage, cookies, or make an API call
    const mockUser: User = {
      id: '1',
      name: 'Player',
      displayName: 'Player',
      email: 'player@example.com'
    };

    // Simulate loading time
    const timer = setTimeout(() => {
      setAuthState({
        user: mockUser,
        loading: false,
        isAuthenticated: true
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return authState;
};