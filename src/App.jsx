import React from "react";
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
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
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
