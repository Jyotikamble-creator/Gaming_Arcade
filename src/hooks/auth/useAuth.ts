'use client';

// Delegate to the central AuthProvider — single source of truth.
export { useAuth } from '@/app/AuthProvider';
export type { User, AuthContextType } from '@/app/AuthProvider';