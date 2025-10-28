import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Header from './home/Header'
import Footer from './home/Footer'

export default function GameLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Visual header (existing) */}
      <Header />

      {/* Router navigation for SPA (uses Links) */}
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/word" style={{ marginRight: 12 }}>Word</Link>
        <Link to="/memory" style={{ marginRight: 12 }}>Memory</Link>
        <Link to="/math" style={{ marginRight: 12 }}>Math</Link>
        <Link to="/typing" style={{ marginRight: 12 }}>Typing</Link>
        <Link to="/2048" style={{ marginRight: 12 }}>2048</Link>
      </nav>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
