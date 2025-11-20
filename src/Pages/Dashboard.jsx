import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const games = [
  { name: 'Word Guess', path: '/word-guess' },
  { name: 'Memory Card', path: '/memory-card' },
  { name: 'Math Quiz', path: '/math-quiz' },
  { name: 'Typing Test', path: '/typing-test' },
  { name: '2048', path: '/2048' },
  { name: 'Word Scramble', path: '/word-scramble' },
  { name: 'Quiz', path: '/quiz' },
  { name: 'Emoji Guess', path: '/emoji-guess' },
  { name: 'Whack Mole', path: '/whack-a-mole' },
  { name: 'Simon Says', path: '/simon-says' },
  { name: 'Tic Tac Toe', path: '/tic-tac-toe' },
]

export default function Dashboard() {
  const nav = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  if (!user) {
    nav('/login')
    return null
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    nav('/')
  }

  return (
    <div className="flex h-screen bg-dark-bg text-light-text">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">Gamehub</h2>
        <ul>
          {games.map((game, i) => (
            <li key={i} className="mb-2">
              <Link to={game.path} className="hover:text-primary-blue">{game.name}</Link>
            </li>
          ))}
        </ul>
        <button onClick={logout} className="mt-4 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to Gamehub, {user.displayName || user.username}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/scores" className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-xl font-semibold mb-2">Scores</h3>
            <p>View all your game scores.</p>
          </Link>
          <Link to="/leaderboard" className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
            <p>See top scores across games.</p>
          </Link>
          <Link to="/progress" className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <p>Track your gaming progress.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
