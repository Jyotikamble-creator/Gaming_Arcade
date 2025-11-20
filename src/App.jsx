import React from "react";
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'

function NotFound() {
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
