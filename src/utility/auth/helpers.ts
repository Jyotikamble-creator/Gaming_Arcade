// Authentication utility functions and helpers

import type {
  SignupRequest,
  LoginRequest,
  ProfileUpdateRequest,
  IUser,
  JWTPayload
} from "@/types/auth/auth";

/**
 * Email validation utility
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email address is too long" };
  }

  return { valid: true };
}

/**
 * Password validation utility
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (!password) {
    errors.push("Password is required");
    return { valid: false, errors, strength };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password is too long (maximum 128 characters)");
  }

  // Check for different character types
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strengthScore = 0;
  if (hasLowerCase) strengthScore++;
  if (hasUpperCase) strengthScore++;
  if (hasNumbers) strengthScore++;
  if (hasSpecialChar) strengthScore++;

  if (strengthScore < 2) {
    strength = 'weak';
    errors.push("Password should contain a mix of letters, numbers, and symbols");
  } else if (strengthScore < 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Check for common weak patterns
  const commonPatterns = [
    /(.)\1{3,}/, // Repeated characters
    /123456|password|qwerty|abc123/i, // Common sequences
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push("Password contains common patterns and may be easily guessed");
    strength = 'weak';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Validate signup request data
 */
export function validateSignupRequest(data: Partial<SignupRequest>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validate email
  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password || '');
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login request data
 */
export function validateLoginRequest(data: Partial<LoginRequest>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error!;
    }
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate profile update request data
 */
export function validateProfileUpdateRequest(data: Partial<ProfileUpdateRequest>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (data.username !== undefined) {
    if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters long";
    } else if (data.username.length > 30) {
      errors.username = "Username must be less than 30 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.username = "Username can only contain letters, numbers, underscores, and hyphens";
    }
  }

  if (data.displayName !== undefined) {
    if (data.displayName.length > 100) {
      errors.displayName = "Display name must be less than 100 characters";
    }
  }

  if (data.bio !== undefined) {
    if (data.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }
  }

  if (data.avatar !== undefined) {
    if (data.avatar.length > 500) {
      errors.avatar = "Avatar URL is too long";
    }
    // Basic URL validation
    if (data.avatar && !/^https?:\/\/.+/i.test(data.avatar)) {
      errors.avatar = "Avatar must be a valid URL";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Parse JWT token (client-side only, for display purposes)
 */
export function parseJWTToken(token: string): JWTPayload | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Split token and decode payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTToken(token);
  if (!payload || !payload.exp) return true;

  // Check if token is expired (with 30 second buffer)
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < (now + 30);
}

/**
 * Get user initials from name or email
 */
export function getUserInitials(user: Partial<IUser>): string {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return 'U';
}

/**
 * Generate display name suggestions from email
 */
export function generateDisplayNameSuggestions(email: string): string[] {
  const [localPart] = email.split('@');
  const suggestions: string[] = [];

  // Remove numbers and special characters, capitalize
  const cleanLocal = localPart.replace(/[0-9._-]/g, '');
  if (cleanLocal.length > 2) {
    suggestions.push(cleanLocal.charAt(0).toUpperCase() + cleanLocal.slice(1));
  }

  // Split by common separators and create variations
  const parts = localPart.split(/[._-]/);
  if (parts.length > 1) {
    suggestions.push(
      parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    );
    suggestions.push(
      parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    );
  }

  // Return unique suggestions
  return [...new Set(suggestions)].slice(0, 3);
}

/**
 * Format user display name
 */
export function formatUserDisplayName(user: Partial<IUser>): string {
  return user.displayName || user.username || user.email || 'User';
}

/**
 * Check profile completion status
 */
export function checkProfileCompletion(user: Partial<IUser>): {
  completed: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const requiredFields = [
    { key: 'email', weight: 20 },
    { key: 'displayName', weight: 15 },
    { key: 'username', weight: 15 },
    { key: 'bio', weight: 15 },
    { key: 'avatar', weight: 10 },
    { key: 'favoriteGame', weight: 10 }
  ];

  let completedWeight = 0;
  const missingFields: string[] = [];
  const totalWeight = requiredFields.reduce((sum, field) => sum + field.weight, 0);

  requiredFields.forEach(field => {
    if (user[field.key as keyof IUser]) {
      completedWeight += field.weight;
    } else {
      missingFields.push(field.key);
    }
  });

  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    completed: completionPercentage >= 80, // Consider 80% as completed
    completionPercentage,
    missingFields
  };
}

/**
 * Secure storage utilities for sensitive auth data
 */
export const secureStorage = {
  /**
   * Store data with encryption (basic obfuscation)
   */
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const encoded = btoa(value); // Basic encoding
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  },

  /**
   * Retrieve and decrypt data
   */
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const encoded = localStorage.getItem(key);
      return encoded ? atob(encoded) : null;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  },

  /**
   * Remove stored data
   */
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing secure data:', error);
    }
  },

  /**
   * Clear all auth-related data
   */
  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear(); // Clear any session data
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};