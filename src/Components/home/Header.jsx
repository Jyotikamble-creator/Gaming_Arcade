import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Header = () => {
  const nav = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    nav('/')
  }

  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3a1 1 0 00-1-1H7a1 1 0 00-1 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 001-1V9a1 1 0 00-1-1H3a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 001 1h3a1 1 0 001-1V4z"></path></svg>
          <Link to="/" className="text-xl font-bold text-light-text">GameHub</Link>
        </div>

        {/* Navigation Links */}
        <div className="space-x-4 hidden md:flex items-center">
          <Link to="/" className="hover:text-primary-blue transition duration-200">Home</Link>
          <Link to="/dashboard" className="hover:text-primary-blue transition duration-200">Dashboard</Link>
          <Link to="/" className="hover:text-primary-blue transition duration-200">Games</Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-primary-blue transition duration-200">{user.displayName || user.username}</Link>
              <button onClick={logout} className="ml-4 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-blue transition duration-200">Login</Link>
              <Link to="/signup" className="hover:text-primary-blue transition duration-200">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header