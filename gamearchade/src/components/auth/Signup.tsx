"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // const data = await signup({ email, password });
      // localStorage.setItem('token', data.token);
      // localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/pages/auth');
    } catch (err: any) {
      console.error('Signup failed', err);
      setError('Signup failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8 border border-gray-700 w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sign Up To Game Arcade
        </h2>
        <p className="text-gray-400">
          Welcome to Game Arcade ????! Please enter your details.
        </p>
      </div>

      <form onSubmit={doSignup} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-subtle-text mb-2">
            Email
          </label>
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
          <label className="block text-sm font-medium text-subtle-text mb-2">
            Password
          </label>
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
          <a href="/pages/auth" className="text-primary-blue hover:text-blue-400 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
