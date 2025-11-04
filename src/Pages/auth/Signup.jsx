import React, { useState } from 'react'
import { signup } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function doSignup(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await signup({ username, email, password, displayName })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      // go to profile to complete
      nav('/profile')
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Signup failed')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign Up</h2>
      <form onSubmit={doSignup}>
        <div>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button type="submit">Create account</button>
        </div>
      </form>
    </div>
  )
}
