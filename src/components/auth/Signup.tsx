"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupProps {
  onSwitchToLogin?: () => void;
  onSuccess?: (user: any) => void;
  onSignup?: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export default function Signup({
  onSwitchToLogin,
  onSuccess,
  onSignup,
  isLoading: externalLoading = false,
}: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isLoading = externalLoading || isSubmitting;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (error) {
      setError('');
    }
  };

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (isLoading) return;

    setIsSubmitting(true);
    try {
      if (onSignup) {
        const result = await onSignup(formData.name, formData.email, formData.password);
        if (result.success) {
          onSuccess?.({ email: formData.email, name: formData.name });
          router.push('/dashboard');
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        // Fallback: direct API call
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed');
          return;
        }
        localStorage.setItem('token', data.token);
        onSuccess?.({ email: formData.email, name: formData.name });
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[Signup] error:', err);
      setError('Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/70">Join and start your gaming adventure</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={doSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.name
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-white/20 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>
          {fieldErrors.name && <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.email
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-white/20 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full pl-10 pr-10 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.password
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-white/20 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/70">
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              disabled={isLoading}
            >
              Sign in
            </button>
          ) : (
            <a href="/pages/auth" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </a>
          )}
        </p>
      </div>
    </motion.div>
  );
}
