// Main application component with routing and lazy loading
import React, { Suspense, lazy } from "react";
// React Router
import { Routes, Route } from 'react-router-dom'
// Logger
import { logger, LogTags } from './lib/logger'

// Core pages (loaded immediately)
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

// Lazy load game pages for better performance
const WordGuess = lazy(() => import('./pages/WordGuess'))
const MemoryCard = lazy(() => import('./pages/MemoryCard'))
const MathQuiz = lazy(() => import('./pages/MathQuiz'))
const TypingTest = lazy(() => import('./pages/TypingTest'))
const Game2048 = lazy(() => import('./pages/Game2048'))
const WordScramble = lazy(() => import('./pages/WordScramble'))
const EmojiGuess = lazy(() => import('./pages/EmojiGuess'))
const WhackMole = lazy(() => import('./pages/WhackMole'))
const TicTacToe = lazy(() => import('./pages/TicTacToe'))
const WordBuilder = lazy(() => import('./pages/WordBuilder'))
const SpeedMath = lazy(() => import('./pages/SpeedMath'))
const PixelArtCreator = lazy(() => import('./pages/PixelArtCreator'))
const MusicTiles = lazy(() => import('./pages/MusicTiles'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ScoresPage = lazy(() => import('./pages/ScoresPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

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

// 404 Not Found component
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

// Main application component
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
          <Route path="/emoji-guess" element={<EmojiGuess />} />
          <Route path="/whack-a-mole" element={<WhackMole />} />
          <Route path="/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/word-builder" element={<WordBuilder />} />
          <Route path="/speed-math" element={<SpeedMath />} />
          <Route path="/hangman" element={<WordPuzzle />} />
          <Route path="/coding-puzzle" element={<CodingPuzzle />} />
          <Route path="/reaction-time" element={<ReactionTime />} />
          <Route path="/brain-teaser" element={<BrainTeaser />} />
          <Route path="/tower-stacker" element={<TowerStacker />} />
          <Route path="/number-maze" element={<NumberMaze />} />
          <Route path="/pixel-art-creator" element={<PixelArtCreator />} />
          <Route path="/music-tiles" element={<MusicTiles />} />

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
