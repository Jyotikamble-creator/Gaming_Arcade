// Signup component for GameArchade auth system

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, X } from "lucide-react";

// Types
import type { 
  SignupFormData, 
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
 * Signup component props
 */
interface SignupProps {
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  isLoading?: boolean;
}

/**
 * Enhanced Signup Component
 */
export default function Signup({ 
  onModeChange, 
  onSuccess, 
  onError,
  isLoading: externalLoading = false 
}: SignupProps) {
  const logger = new Logger({ tag: 'SIGNUP_COMPONENT' });
  const authClient = new AuthApiClient();

  // Form state
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
    newsletter: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isLoading = externalLoading || isSubmitting;

  // Password strength indicator
  const passwordStrength = AuthPageHelpers.Validation.getPasswordStrength(formData.password);

  // Handle input changes
  const handleChange = useCallback((field: keyof SignupFormData, value: any) => {
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
  const handleBlur = useCallback((field: keyof SignupFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field
    const validation = AuthPageHelpers.Validation.validateSignupForm(formData);
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    logger.info('Signup attempt started', { email: formData.email, username: formData.username });

    // Validate form
    const validation = AuthPageHelpers.Validation.validateSignupForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
        agreeToTerms: true
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call signup API
      const response = await authClient.signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim()
      });

      logger.info('Signup successful', { userId: response.user.id });

      // Call success handler
      onSuccess?.(response);
    } catch (error: any) {
      logger.error('Signup failed', { error, email: formData.email });
      
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

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Password strength color
  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    if (score < 6) return 'bg-blue-500';
    return 'bg-green-500';
  };

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
        <h2 className="text-2xl font-bold text-white mb-2">Join the Adventure!</h2>
        <p className="text-subtle-text">Create your account to start gaming</p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800 text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              placeholder="Choose a username"
            />
          </div>
          {errors.username && touched.username && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
            >
              {errors.username.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </motion.div>
          )}
        </div>

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
              autoComplete="new-password"
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
              placeholder="Create a password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength.score < 2 ? 'text-red-400' :
                  passwordStrength.score < 4 ? 'text-yellow-400' :
                  passwordStrength.score < 6 ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
            </motion.div>
          )}

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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={isLoading}
              className={`
                w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-800 text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 flex items-center"
            >
              {formData.password === formData.confirmPassword ? (
                <div className="flex items-center text-green-400 text-sm">
                  <Check className="h-4 w-4 mr-1" />
                  Passwords match
                </div>
              ) : (
                <div className="flex items-center text-red-400 text-sm">
                  <X className="h-4 w-4 mr-1" />
                  Passwords don't match
                </div>
              )}
            </motion.div>
          )}

          {errors.confirmPassword && touched.confirmPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
            >
              {errors.confirmPassword.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </motion.div>
          )}
        </div>

        {/* Terms Agreement */}
        <div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded mt-1"
            />
            <span className="text-sm text-gray-300">
              I agree to the{' '}
              <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && touched.agreeToTerms && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
            >
              {errors.agreeToTerms.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </motion.div>
          )}
        </div>

        {/* Newsletter Subscription */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.newsletter}
              onChange={(e) => handleChange('newsletter', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
            />
            <span className="text-sm text-gray-300">
              Subscribe to newsletter for game updates and tips
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-transparent
            rounded-lg shadow-sm text-white font-medium transition-all duration-200
            ${isLoading || !formData.agreeToTerms
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </motion.button>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onModeChange('login')}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}