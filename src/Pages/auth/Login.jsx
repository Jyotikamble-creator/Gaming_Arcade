import React, { useState } from 'react'
import { login } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function doLogin(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await login({ usernameOrEmail, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Login failed')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={doLogin}>
        <div>
          <label>Username or Email</label>
          <input value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}
