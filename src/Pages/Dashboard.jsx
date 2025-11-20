import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/gamehub/Sidebar'

export default function Dashboard() {
  const nav = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  if (!user) {
    nav('/login')
    return null
  }

  return (
    <div className="flex h-screen bg-dark-bg text-light-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Welcome to Game Hub 😊👋🏻.
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/scores"
              className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-700 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">My Scores</h3>
              </div>
              <p className="text-gray-400">View all your game scores and performance history.</p>
            </Link>

            <Link
              to="/leaderboard"
              className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-700 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
              </div>
              <p className="text-gray-400">See top scores across all games and compete with other players.</p>
            </Link>

            <Link
              to="/progress"
              className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-700 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Progress</h3>
              </div>
              <p className="text-gray-400">Track your gaming progress and achievements over time.</p>
            </Link>
          </div>

          {/* Quick Stats or Additional Content */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 mb-4">
                Choose a game from the sidebar to start playing, or check your scores and progress using the cards above.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/word-guess"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Play Word Guess
                </Link>
                <Link
                  to="/math-quiz"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Take Math Quiz
                </Link>
                <Link
                  to="/memory-card"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Memory Card Game
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
