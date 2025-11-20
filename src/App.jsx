import React from "react";
import { Routes, Route } from 'react-router-dom'
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
