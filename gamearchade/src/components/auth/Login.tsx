// Login component for GameArchade auth system

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

// Types
import type { 
  LoginFormData, 
  AuthPageError, 
  AuthMode 
} from "@/types/auth/page";
import type { AuthResponse } from "@/types/auth/auth";

// API
import { AuthApiClient } from "@/lib/auth/client";

// Utilities
import { AuthPageHelpers } from "@/utility/auth/page-helpers";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * Login component props
 */
interface LoginProps {
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  isLoading?: boolean;
}

/**
 * Enhanced Login Component
 */
export default function Login({ 
  onModeChange, 
  onSuccess, 
  onError,
  isLoading: externalLoading = false 
}: LoginProps) {
  const logger = new Logger({ tag: 'LOGIN_COMPONENT' });
  const authClient = new AuthApiClient();

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isLoading = externalLoading || isSubmitting;

  // Handle input changes
  const handleChange = useCallback((field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur for validation
  const handleBlur = useCallback((field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field
    const validation = AuthPageHelpers.Validation.validateLoginForm(formData);
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    logger.info('Login attempt started', { email: formData.email });

    // Validate form
    const validation = AuthPageHelpers.Validation.validateLoginForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        email: true,
        password: true,
        rememberMe: true
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call login API
      const response = await authClient.login({
        email: formData.email.trim(),
        password: formData.password
      });

      logger.info('Login successful', { userId: response.user.id });

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Call success handler
      onSuccess?.(response);
    } catch (error: any) {
      logger.error('Login failed', { error, email: formData.email });
      
      const authError = AuthPageHelpers.Error.parseApiError(error);
      onError?.(authError);

      // Set form-specific errors
      if (authError.field) {
        setErrors({ [authError.field]: [authError.message] });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isLoading, authClient, onSuccess, onError, logger]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
        <p className="text-subtle-text">Sign in to continue your gaming journey</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800 text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && touched.email && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
            >
              {errors.email.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </motion.div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-800 text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && touched.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
            >
              {errors.password.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </motion.div>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
            />
            <span className="ml-2 text-sm text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => onModeChange('forgot-password')}
            disabled={isLoading}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-transparent
            rounded-lg shadow-sm text-white font-medium transition-all duration-200
            ${isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Signing In...
            </div>
          ) : (
            <div className="flex items-center">
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </motion.button>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onModeChange('signup')}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}