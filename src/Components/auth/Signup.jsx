import React, { useState } from 'react';
import { signup } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  async function doSignup(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = await signup({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/login');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8 border border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-light-text mb-6 text-center">Sign Up</h2>

        <form onSubmit={doSignup} className="space-y-6">
          {/* Username Field */}
         

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-subtle-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-subtle-text mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Enter your password"
              required
            />
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
            className="w-full bg-primary-blue hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-subtle-text">
            Already have an account?{' '}
            <a href="/login" className="text-primary-blue hover:text-blue-400 font-medium">
              Login 
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
