// ForgotPassword component for GameArchade auth system

"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

// Types
import type { 
  ForgotPasswordFormData, 
  AuthPageError, 
  AuthMode 
} from "@/types/auth/page";

// API
import { AuthApiClient } from "@/lib/auth/client";

// Utilities
import { AuthPageHelpers } from "@/utility/auth/page-helpers";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * ForgotPassword component props
 */
interface ForgotPasswordProps {
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: () => void;
  onError?: (error: AuthPageError) => void;
  isLoading?: boolean;
}

/**
 * Enhanced ForgotPassword Component
 */
export default function ForgotPassword({ 
  onModeChange, 
  onSuccess, 
  onError,
  isLoading: externalLoading = false 
}: ForgotPasswordProps) {
  const logger = new Logger({ tag: 'FORGOT_PASSWORD_COMPONENT' });
  const authClient = new AuthApiClient();

  // Form state
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isLoading = externalLoading || isSubmitting;

  // Handle input changes
  const handleChange = useCallback((field: keyof ForgotPasswordFormData, value: any) => {
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
  const handleBlur = useCallback((field: keyof ForgotPasswordFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate email field
    const emailErrors = AuthPageHelpers.Validation.validateEmail(formData.email);
    if (emailErrors.length > 0) {
      setErrors(prev => ({ ...prev, email: emailErrors }));
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isSuccess) return;

    logger.info('Forgot password attempt started', { email: formData.email });

    // Validate email
    const emailErrors = AuthPageHelpers.Validation.validateEmail(formData.email);
    
    if (emailErrors.length > 0) {
      setErrors({ email: emailErrors });
      setTouched({ email: true });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call forgot password API
      await authClient.forgotPassword({ email: formData.email.trim() });

      logger.info('Forgot password request successful', { email: formData.email });

      // Show success state
      setIsSuccess(true);

      // Call success handler
      onSuccess?.();
    } catch (error: any) {
      logger.error('Forgot password failed', { error, email: formData.email });
      
      const authError = AuthPageHelpers.Error.parseApiError(error);
      onError?.(authError);

      // Set form-specific errors
      if (authError.field) {
        setErrors({ [authError.field]: [authError.message] });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isLoading, isSuccess, authClient, onSuccess, onError, logger]);

  // Reset form and go back to login
  const handleBackToLogin = useCallback(() => {
    setFormData({ email: '' });
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    onModeChange('login');
  }, [onModeChange]);

  // Send another email
  const handleSendAnother = useCallback(() => {
    setIsSuccess(false);
    setErrors({});
    setTouched({});
  }, []);

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
        <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
        <p className="text-gray-300 mb-2">
          We've sent a password reset link to:
        </p>
        <p className="text-blue-400 font-medium mb-6">{formData.email}</p>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            <strong>Next steps:</strong><br />
            1. Check your email inbox (and spam folder)<br />
            2. Click the reset link in the email<br />
            3. Follow the instructions to create a new password
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSendAnother}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Send Another Email
          </button>
          <button
            onClick={handleBackToLogin}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
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
        <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
        <p className="text-subtle-text">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your email address"
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

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.email.trim()}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-transparent
            rounded-lg shadow-sm text-white font-medium transition-all duration-200
            ${isLoading || !formData.email.trim()
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Sending Reset Link...
            </div>
          ) : (
            <div className="flex items-center">
              Send Reset Link
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          )}
        </motion.button>

        {/* Additional Info */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            <strong>Having trouble?</strong><br />
            Make sure to check your spam folder. If you don't receive an email within 5 minutes, 
            try using the email address you originally signed up with.
          </p>
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </button>
        </div>
      </form>
    </motion.div>
  );
}