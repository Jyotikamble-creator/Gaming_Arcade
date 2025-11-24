import React from 'react'
import { useLocation } from 'react-router-dom'
import Login from '../components/auth/Login'
import Signup from '../components/auth/Signup'

export default function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Gaming Arcade</h1>
          <p className="text-subtle-text">Welcome to the ultimate gaming experience</p>
        </div>

        {/* Auth Form */}
        {isLogin ? <Login /> : <Signup />}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-subtle-text text-sm">
            You will be enjoy the platform .
          </p>
        </div>
      </div>
    </div>
  )
}