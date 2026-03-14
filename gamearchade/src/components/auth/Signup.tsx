"use client";

import React, { useState } from 'react';
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isLoading = externalLoading || isSubmitting;

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsSubmitting(true);
    try {
      if (onSignup) {
        const result = await onSignup(name, email, password);
        if (result.success) {
          onSuccess?.({ email, name });
          router.push('/dashboard');
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        // Fallback: direct API call
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed');
          return;
        }
        localStorage.setItem('token', data.token);
        onSuccess?.({ email, name });
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
    <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8 border border-gray-700 w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sign Up To Game Arcade
        </h2>
        <p className="text-gray-400">
          Create your account and start playing!
        </p>
      </div>

      <form onSubmit={doSignup} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-subtle-text mb-2">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Your name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle-text mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle-text mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-md text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-blue hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-subtle-text">
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              onClick={onSwitchToLogin}
              className="text-primary-blue hover:text-blue-400 font-medium underline focus:outline-none"
            >
              Login
            </button>
          ) : (
            <a href="/pages/auth" className="text-primary-blue hover:text-blue-400 font-medium underline">
              Login
            </a>
          )}
        </p>
      </div>
    </div>
  );
}
