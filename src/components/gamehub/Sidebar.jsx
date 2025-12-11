import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  }

  return (
    <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-white">Game Hub</h2>
      
      <div className="space-y-4">
        <Link
          to="/scores"
          className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">My Scores</h3>
          </div>
          <p className="text-gray-400 text-sm">View your game scores</p>
        </Link>

        <Link
          to="/leaderboard"
          className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Leaderboard</h3>
          </div>
          <p className="text-gray-400 text-sm">Top scores globally</p>
        </Link>

        <Link
          to="/progress"
          className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Progress</h3>
          </div>
          <p className="text-gray-400 text-sm">Track achievements</p>
        </Link>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-700 space-y-3">
        <Link
          to="/profile"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
        >
          👤 My Profile
        </Link>
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;