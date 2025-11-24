import React, { Suspense, lazy } from "react";
import { Routes, Route } from 'react-router-dom'
import { logger, LogTags } from './lib/logger'

// Core pages (loaded immediately)
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'

// Lazy load game pages for better performance
// import all game pages using React.lazy
const WordGuess = lazy(() => import('./pages/WordGuess.jsx'))
const MemoryCard = lazy(() => import('./pages/MemoryCard.jsx'))
const MathQuiz = lazy(() => import('./pages/MathQuiz.jsx'))
const TypingTest = lazy(() => import('./pages/TypingTest.jsx'))
const Game2048 = lazy(() => import('./pages/Game2048.jsx'))
const WordScramble = lazy(() => import('./pages/WordScramble.jsx'))
const Quiz = lazy(() => import('./pages/Quiz.jsx'))
const EmojiGuess = lazy(() => import('./pages/EmojiGuess.jsx'))
const WhackMole = lazy(() => import('./pages/WhackMole.jsx'))
const SimonSays = lazy(() => import('./pages/SimonSays.jsx'))
const TicTacToe = lazy(() => import('./pages/TicTacToe.jsx'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage.jsx'))
const ScoresPage = lazy(() => import('./pages/ScoresPage.jsx'))
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))

// Loading component for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Loading game...</p>
      </div>
    </div>
  )
}

function NotFound() {
  logger.warn('404 Page not found accessed', { path: window.location.pathname }, LogTags.SESSIONS)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center text-white p-8">
        <h2 className="text-4xl font-bold mb-4">404 — Page Not Found</h2>
        <p className="text-xl mb-4">Path: {window.location.pathname}</p>
        <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Go Home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Core pages - loaded immediately */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Game pages - lazy loaded */}
          <Route path="/word-guess" element={<WordGuess />} />
          <Route path="/memory-card" element={<MemoryCard />} />
          <Route path="/math-quiz" element={<MathQuiz />} />
          <Route path="/typing-test" element={<TypingTest />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/word-scramble" element={<WordScramble />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/emoji-guess" element={<EmojiGuess />} />
          <Route path="/whack-a-mole" element={<WhackMole />} />
          <Route path="/simon-says" element={<SimonSays />} />
          <Route path="/tic-tac-toe" element={<TicTacToe />} />
          
          {/* Utility pages - lazy loaded */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/scores" element={<ScoresPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}
