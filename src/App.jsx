import React from "react";
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import WordGuess from './pages/WordGuess'
import MemoryCard from './pages/MemoryCard'
import MathQuiz from './pages/MathQuiz'
import TypingTest from './pages/TypingTest'
import Game2048 from './pages/Game2048'
import WordScramble from './pages/WordScramble'
import Quiz from './pages/Quiz'
import EmojiGuess from './pages/EmojiGuess'
import WhackMole from './pages/WhackMole'
import SimonSays from './pages/SimonSays'
import TicTacToe from './pages/TicTacToe'
import LeaderboardPage from './pages/LeaderboardPage'
import ScoresPage from './pages/ScoresPage'
import ProgressPage from './pages/ProgressPage'
import { logger, LogTags } from './lib/logger'

function NotFound() {
  logger.warn('404 Page not found accessed', { path: window.location.pathname }, LogTags.SESSIONS)
  return (
    <div style={{ padding: 20 }}>
      <h2>404 — Page not found</h2>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
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
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/scores" element={<ScoresPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
