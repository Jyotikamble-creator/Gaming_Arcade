import React, { useEffect, useState } from 'react'
import { me } from '../api/authApi'

export default function Profile() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await me()
        setUser(r.user)
        setDisplayName(r.user.displayName || '')
      } catch (e) {
        console.error('profile load', e)
      }
    }
    load()
  }, [])

  async function save() {
    try {
      setError(null)
      // Call the new profile update API
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ displayName })
      })
      if (!response.ok) throw new Error('Failed to update profile')
      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      alert('Profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    }
  }

  if (!user) return <div style={{ padding: 20 }}>Not signed in</div>

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <div>Username: {user.username}</div>
      <div style={{ marginTop: 8 }}>
        <label>Display name</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12 }}>
        <button onClick={save}>Save profile</button>
      </div>
    </div>
  )
}
