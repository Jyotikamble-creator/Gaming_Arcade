import React, { useState } from 'react'
import { login } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function doLogin(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await login({ usernameOrEmail, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Login failed')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={doLogin}>
        <div>
          <label>Username or Email</label>
          <input value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser } from '@/lib/auth/authSlice';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log('Login successful:', result);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Signup Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}