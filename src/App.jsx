
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Profile from './pages/Profile'
import Home from './pages/Home'


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
      <Route path="/profile" element={<Profile />} />
     
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
