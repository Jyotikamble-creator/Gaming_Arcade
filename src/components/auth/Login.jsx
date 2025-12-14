// Login component for user authentication
// Handles user input, form submission, and error display
import React, { useState } from 'react';
// Icon imports
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// API module for user authentication
import { login } from '../../api/authApi';
// Router module
import { useNavigate } from 'react-router-dom';

// Login component
export default function Login() {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  // Handle form submission
  async function doLogin(e) {
    // Prevent default form submission
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Attempt user login
      const data = await login({ email, password });
      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) {
      // Enhanced error handling
      const error = err;
      console.error('Login failed - Full error details:', {
        error: error,
        message: error?.message,
        status: error?.status,
        name: error?.name,
        stack: error?.stack,
        response: error?.response,
        request: error?.request
      });

      // Check if this is a network error (backend not running)
      if (error?.message?.includes('Network Error') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('fetch') ||
        error?.name === 'ConnectionError' ||
        error?.status === 404) {
        console.error('BACKEND CONNECTION ERROR:');
        console.error('- Backend server is not running on port 5000');
        console.error('- Check if server is started in server directory');
        console.error('- Verify API endpoints are correct');

        setError(' Backend Server Not Running - Please start the backend server first.');
      } else {
        console.error(' LOGIN ERROR:', error?.message || 'Unknown error');
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Render the login form
  return (
    <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8 border border-gray-700 w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Login to your account
        </h2>
        <p className="text-gray-400">
          Welcome back 👋🏻! Please enter your details.
        </p>
      </div>

      {/* login form */}
      <form onSubmit={doLogin} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Show login errors */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-primary-blue hover:text-blue-400 transition-colors"
          >
            Forgot your password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      {/* Signup Link */}
      <div className="text-center">
        <span className="text-gray-400 text-sm">
          Don&apos;t have an account?{' '}
        </span>
        <a
          href="/signup"
          className="text-sm text-primary-blue hover:text-blue-400 transition-colors"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}