// ResetPassword component for GameArchade auth system

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle, Shield } from "lucide-react";

// Types
import type { 
  ResetPasswordFormData, 
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
 * ResetPassword component props
 */
interface ResetPasswordProps {
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  isLoading?: boolean;
  token?: string; // Reset token from URL
}

/**
 * Enhanced ResetPassword Component
 */
export default function ResetPassword({ 
  onModeChange, 
  onSuccess, 
  onError,
  isLoading: externalLoading = false,
  token: initialToken 
}: ResetPasswordProps) {
  const logger = new Logger({ tag: 'RESET_PASSWORD_COMPONENT' });
  const authClient = new AuthApiClient();

  // Form state
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    token: initialToken || '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isLoading = externalLoading || isSubmitting;

  // Password strength indicator
  const passwordStrength = AuthPageHelpers.Validation.getPasswordStrength(formData.password);

  // Extract token from URL if not provided as prop
  useEffect(() => {
    if (!initialToken && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        setFormData(prev => ({ ...prev, token: urlToken }));
      }
    }
  }, [initialToken]);

  // Handle input changes
  const handleChange = useCallback((field: keyof ResetPasswordFormData, value: any) => {
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
  const handleBlur = useCallback((field: keyof ResetPasswordFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field based on current form data
    const validation = AuthPageHelpers.Validation.validateResetPasswordForm(formData);
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isSuccess) return;

    logger.info('Reset password attempt started');

    // Validate form
    const validation = AuthPageHelpers.Validation.validateResetPasswordForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        token: true,
        password: true,
        confirmPassword: true
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call reset password API
      const response = await authClient.resetPassword({
        token: formData.token.trim(),
        password: formData.password
      });

      logger.info('Reset password successful');

      // Show success state
      setIsSuccess(true);

      // Call success handler
      onSuccess?.(response);
    } catch (error: any) {
      logger.error('Reset password failed', { error });
      
      const authError = AuthPageHelpers.Error.parseApiError(error);
      onError?.(authError);

      // Set form-specific errors
      if (authError.field) {
        setErrors({ [authError.field]: [authError.message] });
      } else {
        // Token might be invalid or expired
        setErrors({ token: [authError.message] });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isLoading, isSuccess, authClient, onSuccess, onError, logger]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Go to login after success
  const handleGoToLogin = useCallback(() => {
    onModeChange('login');
  }, [onModeChange]);

  // Password strength color
  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    if (score < 6) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-green-500/20 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </motion.div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-white mb-4">Password Reset Complete!</h2>
        <p className="text-gray-300 mb-6">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-300 text-sm">
            <strong>Security tip:</strong> Remember to use a unique password that you haven't used elsewhere. 
            Consider using a password manager to keep your accounts secure.
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoToLogin}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          Continue to Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  // Check if token is missing
  if (!formData.token.trim()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full text-center"
      >
        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
        <p className="text-gray-300 mb-6">
          This password reset link appears to be invalid or has expired. 
          Please request a new password reset link.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => onModeChange('forgot-password')}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Request New Reset Link
          </button>
          <button
            onClick={() => onModeChange('login')}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </motion.div>
    );
  }

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
        <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
        <p className="text-subtle-text">
          Choose a strong password for your account
        </p>
      </div>

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            New Password
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
              placeholder="Enter your new password"
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
            Confirm New Password
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
              placeholder="Confirm your new password"
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
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Passwords match
                </div>
              ) : (
                <div className="flex items-center text-red-400 text-sm">
                  <Shield className="h-4 w-4 mr-1" />
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

        {/* Token Error */}
        {errors.token && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            {errors.token.map((error, index) => (
              <p key={index} className="text-red-400 text-sm">{error}</p>
            ))}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || formData.password !== formData.confirmPassword || !formData.password}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-transparent
            rounded-lg shadow-sm text-white font-medium transition-all duration-200
            ${isLoading || formData.password !== formData.confirmPassword || !formData.password
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Updating Password...
            </div>
          ) : (
            <div className="flex items-center">
              Update Password
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </motion.button>

        {/* Security Note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Security recommendations:</strong><br />
            • Use a unique password you haven't used elsewhere<br />
            • Include a mix of letters, numbers, and symbols<br />
            • Make it at least 12 characters long<br />
            • Consider using a password manager
          </p>
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </motion.div>
  );
}