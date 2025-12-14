// Signup component for user registration
// Includes enhanced error handling with detailed logging 
import React, { useState } from 'react';
// Icon imports
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// API module for user authentication
import { signup } from '../../api/authApi';
// Router module
import { useNavigate } from 'react-router-dom';

// Signup component
export default function Signup() {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  // Handle form submission
  async function doSignup(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Attempt user signup
      const data = await signup({ email, password });
      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/login');
    } catch (err) {
      // Enhanced error handling with detailed logging
      console.error('Signup failed - Full error details:', {
        error: err,
        message: err?.message,
        status: err?.status,
        name: err?.name,
        stack: err?.stack,
        response: err?.response,
        request: err?.request,
        isAxiosError: err?.isAxiosError,
        hasResponse: !!err?.response,
        responseStatus: err?.response?.status,
        responseData: err?.response?.data
      });

      // Check for HTTP error responses first, then network errors
      if (err?.response) {
        // We have a response, so it's an HTTP error
        if (err.response.status === 409) {
          console.error('409 Conflict - Email already exists');
          setError('An account with this email already exists.');
        } else if (err.response.status === 400) {
          console.error('400 Bad Request - Invalid input');
          setError('Invalid email or password format. Please check your input.');
        } else if (err.response.status >= 500) {
          console.error('Server error (5xx)');
          setError('Server error: Please try again later.');
        } else {
          console.error('Other HTTP error:', err.response.status);
          setError(err?.response?.data?.error || err?.message || 'Signup failed');
        }
      } else {
        // No response - likely a network error
        console.error(' BACKEND CONNECTION ERROR:');
        console.error('- Backend server is not running on port 4000');
        console.error('- Check if server is started in server directory');
        console.error('- Verify API endpoints are correct');
        console.error('Error details:', err?.message, err?.code, err?.name);

        setError(' Backend Server Not Running - Please start the backend server first.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Render the signup form
  return (
    <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8 border border-gray-700 w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sign Up To Game Arcade
        </h2>
        <p className="text-gray-400">
          Welcome to Game Arcade 👋🏻! Please enter your details.
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={doSignup} className="space-y-6">
        {/* Email Field */}
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

        {/* Password Field */}
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
          className="w-full bg-primary-blue hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-subtle-text">
          Already have an account?{' '}
          <a href="/login" className="text-primary-blue hover:text-blue-400 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
