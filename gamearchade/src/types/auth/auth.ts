// Type definitions for authentication
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  favoriteGame?: string;
  profileCompleted?: boolean;
  meta?: Record<string, any>;
  createdAt: Date;
  lastLogin?: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Request body types
export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  favoriteGame?: string;
  username?: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
    favoriteGame?: string;
    profileCompleted?: boolean;
    createdAt: Date;
  };
}

export interface ErrorResponse {
  error: string;
}
