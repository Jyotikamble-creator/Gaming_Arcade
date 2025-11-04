import React, { useEffect, useState } from 'react'
import { me } from './api/../api/authApi'

export default function Profile() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [displayName, setDisplayName] = useState(user?.displayName || '')

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

  function save() {
    // Minimal: store on client until server profile endpoint exists
    const updated = { ...user, displayName }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
    alert('Profile saved locally. Server update endpoint not implemented.')
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
      <div style={{ marginTop: 12 }}>
        <button onClick={save}>Save profile</button>
      </div>
    </div>
  )
}
