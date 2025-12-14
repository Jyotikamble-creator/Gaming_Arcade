// User profile page
import React, { useEffect, useState } from 'react';
// API module for user authentication
import { me, updateProfile } from '../../api/authApi';
// Animated background component
import AnimatedBackground from '../AnimatedBackground';
// Router module
import { logger, LogTags } from '../../lib/logger'

// User profile component
export default function MyProfile() {
  // State variables
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    avatar: '',
    favoriteGame: ''
  })

  // Available games for favorite selection
  const games = [
    { id: 'word-guess', name: 'Word Guess', icon: '🔤' },
    { id: 'memory-card', name: 'Memory Card', icon: '🧠' },
    { id: 'math-quiz', name: 'Math Quiz', icon: '🧮' },
    { id: 'typing-test', name: 'Typing Test', icon: '⌨️' },
    { id: 'emoji-guess', name: 'Emoji Guess', icon: '😀' },
    { id: 'simon-says', name: 'Simon Says', icon: '🎯' },
    { id: 'whack-mole', name: 'Whack a Mole', icon: '🐭' },
    { id: 'word-scramble', name: 'Word Scramble', icon: '🔀' },
    { id: 'quiz', name: 'Quiz', icon: '📝' }
  ]

  // Load user profile on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to access your profile.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    loadUserProfile()
  }, [])

  // Function to load user profile
  const loadUserProfile = async () => {
    try {
      setLoading(true)
      logger.debug('Loading user profile', {}, LogTags.SESSIONS)
      const response = await me()
      const userData = response.user
      setUser(userData)

      // Initialize form data
      setFormData({
        displayName: userData.displayName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        favoriteGame: userData.favoriteGame || ''
      })

      logger.info('User profile loaded successfully', { userId: userData.id }, LogTags.SESSIONS)
    } catch (e) {
      logger.error('Failed to load user profile', e, {}, LogTags.SESSIONS)

      // Handle authentication errors
      if (e.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (!e.response) {
        setError('Network error. Please check your connection.')
      } else {
        setError('Failed to load profile. Please try again.')
      }

      console.error('Failed to load profile', e)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission
  const handleSave = async () => {
    const performSave = async (retryCount = 0) => {
      try {
        // Validate form data
        setSaving(true)
        setError(null)

        logger.info('Saving user profile', { userId: user?.id }, LogTags.SESSIONS)
        const response = await updateProfile(formData)
        const updatedUser = response.user

        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsEditing(false)

        logger.info('User profile saved successfully', { userId: updatedUser.id }, LogTags.SESSIONS)
      } catch (e) {
        logger.error('Failed to save user profile', e, formData, LogTags.SESSIONS)

        // Handle different types of errors
        let errorMessage = 'Failed to save profile. Please try again.'
        if (!e.response) {
          // Network error - retry once
          if (retryCount < 1) {
            console.log('Network error, retrying...')
            setTimeout(() => performSave(retryCount + 1), 1000)
            return
          }
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (e.response.status === 401) {
          // Unauthorized - token expired
          errorMessage = 'Your session has expired. Please log in again.'
          // Clear invalid token
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Redirect to login
          window.location.href = '/login'
          return
        } else if (e.response.status === 400) {
          // Validation error
          errorMessage = e.response.data?.error || 'Invalid data. Please check your input.'
        } else if (e.response.data?.error) {
          errorMessage = e.response.data.error
        }

        setError(errorMessage)
        console.error('Failed to save profile', e)
      } finally {
        setSaving(false)
      }
    }

    await performSave()
  }

  // Handle cancel button
  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      favoriteGame: user?.favoriteGame || ''
    })
    setIsEditing(false)
    setError(null)
  }

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0

    // When editing, show preview based on form data
    // When not editing, show actual saved completion
    const dataToCheck = isEditing ? formData : {
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      favoriteGame: user.favoriteGame || ''
    }

    let completed = 0
    let total = 5

    if (user.displayName) completed++
    if (user.username) completed++
    if (user.bio) completed++
    if (user.avatar) completed++
    if (user.favoriteGame) completed++

    return Math.round((completed / total) * 100)
  }
  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text text-xl font-semibold">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Render not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-light-text mb-2">Not Signed In</h2>
          <p className="text-subtle-text mb-6">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  // Calculate actual completion percentage
  const actualCompletionPercentage = (() => {
    if (!user) return 0
    let completed = 0
    let total = 5

    // Check each profile field
    if (user.displayName && user.displayName.trim()) completed++
    if (user.username && user.username.trim()) completed++
    if (user.bio && user.bio.trim()) completed++
    if (user.avatar && user.avatar.trim()) completed++
    if (user.favoriteGame && user.favoriteGame.trim()) completed++

    return Math.round((completed / total) * 100)
  })()

  // Calculate completion percentage
  const completionPercentage = getProfileCompletion()
  const favoriteGame = games.find(g => g.id === user.favoriteGame)

  // Render profile page
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-pulse">
            👤 My Profile
          </h1>
          <p className="text-subtle-text text-lg">Manage your gaming profile and preferences</p>
        </div>

        {/* Profile Completion */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Profile Completion</h3>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                  Preview
                </span>
              )}
              <span className="text-sm font-medium text-blue-400">{completionPercentage}% Complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isEditing ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-subtle-text text-sm">
            {isEditing
              ? "This shows what your completion will be after saving. Complete your profile to unlock achievements!"
              : "Complete your profile to unlock achievements and personalized features!"
            }
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  {isEditing ? (
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(formData.displayName || user.email)}
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(user.displayName || user.email)}
                    </div>
                  )}
                  {actualCompletionPercentage === 100 && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Display Name"
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Username"
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {user.displayName || 'Anonymous Player'}
                      </h2>
                      <p className="text-subtle-text">@{user.username || 'guest'}</p>
                      <p className="text-gray-400 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - More Prominent */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-center"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-center"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-center"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-400">{error}</span>
                  </div>
                  {(error.includes('Network error') || error.includes('connection')) && (
                    <button
                      onClick={() => {
                        setError(null)
                        if (isEditing) {
                          handleSave()
                        } else {
                          loadUserProfile()
                        }
                      }}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-subtle-text mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="bg-gray-700/20 rounded-lg p-3 min-h-[100px]">
                      <p className="text-light-text">
                        {user.bio || 'No bio yet. Tell other players about yourself!'}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  )}
                </div>

                {/* Favorite Game */}
                <div>
                  <label className="block text-sm font-medium text-subtle-text mb-2">
                    Favorite Game
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.favoriteGame}
                      onChange={(e) => handleInputChange('favoriteGame', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your favorite game</option>
                      {games.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.icon} {game.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-gray-700/20 rounded-lg p-3">
                      {favoriteGame ? (
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{favoriteGame.icon}</span>
                          <span className="text-light-text font-medium">{favoriteGame.name}</span>
                        </div>
                      ) : (
                        <p className="text-gray-400">No favorite game selected</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Account Info */}
                <div>
                  <label className="block text-sm font-medium text-subtle-text mb-2">
                    Account Information
                  </label>
                  <div className="bg-gray-700/20 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-subtle-text">Email:</span>
                      <span className="text-light-text">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle-text">Member since:</span>
                      <span className="text-light-text">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle-text">Profile Status:</span>
                      <span className={`font-medium ${actualCompletionPercentage === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {actualCompletionPercentage === 100 ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <label className="block text-sm font-medium text-subtle-text mb-2">
                    Quick Stats
                  </label>
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{actualCompletionPercentage}%</p>
                        <p className="text-xs text-subtle-text">Profile Complete</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">
                          {new Date(user.createdAt).getFullYear()}
                        </p>
                        <p className="text-xs text-subtle-text">Joined</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}