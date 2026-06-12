"use client";

// Single source of truth for auth: re-export everything from AuthProvider.
// Import useAuth, AuthProvider, and User types from here or directly from AuthProvider.
export { AuthProvider, useAuth } from '@/app/AuthProvider';
export type { User, AuthContextType } from '@/app/AuthProvider';