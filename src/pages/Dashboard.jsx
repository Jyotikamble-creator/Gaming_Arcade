import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/gamehub/Sidebar'

const games = [
  { name: 'Word Guess', path: '/word-guess', icon: '📝', color: 'blue' },
  { name: 'Memory Card', path: '/memory-card', icon: '🃏', color: 'purple' },
  { name: 'Math Quiz', path: '/math-quiz', icon: '🔢', color: 'green' },
  { name: 'Typing Test', path: '/typing-test', icon: '⌨️', color: 'indigo' },
  { name: 'Game2048', path: '/2048', icon: '🎯', color: 'yellow' },
  { name: 'Word Scramble', path: '/word-scramble', icon: '🔤', color: 'pink' },
  { name: 'Quiz', path: '/quiz', icon: '❓', color: 'red' },
  { name: 'Emoji Guess', path: '/emoji-guess', icon: '😊', color: 'orange' },
  { name: 'Whack Mole', path: '/whack-a-mole', icon: '🔨', color: 'brown' },
  { name: 'Simon Says', path: '/simon-says', icon: '🎮', color: 'cyan' },
  { name: 'Tic Tac Toe', path: '/tic-tac-toe', icon: '❌', color: 'teal' },
  { name: 'Sudoku', path: '/sudoku', icon: '🧩', color: 'violet' },
  { name: 'Word Builder', path: '/word-builder', icon: '🏗️', color: 'lime' },
  { name: 'Speed Math', path: '/speed-math', icon: '⚡', color: 'amber' },
  { name: 'Hangman', path: '/hangman', icon: '🎯', color: 'rose' },
  { name: 'Coding Puzzle', path: '/coding-puzzle', icon: '💻', color: 'blue' },
  { name: 'Reaction Time', path: '/reaction-time', icon: '⏱️', color: 'indigo' },
  { name: 'Brain Teaser', path: '/brain-teaser', icon: '🧠', color: 'purple' },
  { name: 'Tower Stacker', path: '/tower-stacker', icon: '🏗️', color: 'cyan' },
  { name: 'Sliding Puzzle', path: '/sliding-puzzle', icon: '🧩', color: 'violet' },
  { name: 'Number Maze', path: '/number-maze', icon: '🔢', color: 'emerald' },
  { name: 'Pixel Art Creator', path: '/pixel-art-creator', icon: '🎨', color: 'pink' },
];

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
    <div className="flex h-screen text-light-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Welcome to Game Hub 😊👋🏻
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Link
                key={index}
                to={game.path}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 border border-gray-700 group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-${game.color}-400 transition-colors">
                    {game.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
