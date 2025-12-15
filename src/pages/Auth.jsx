// This component handles user authentication by rendering either the Login or Signup component
import { useLocation } from 'react-router-dom';
// Importing necessary components for authentication
import Login from '../components/auth/Login'
// Importing Signup component
import Signup from '../components/auth/Signup';

// Defining the Auth component
export default function Auth() {
  // Using useLocation hook to determine the current path
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  // Rendering the Auth component
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