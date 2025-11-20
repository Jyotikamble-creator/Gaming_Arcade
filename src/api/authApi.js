import API from './Api'

export async function signup({ username, email, password, displayName }) {
  const res = await API.post('/api/auth/signup', { email, password })
  return res.data
}

export async function login({ usernameOrEmail, password }) {
  const res = await API.post('/api/auth/login', { email, password })
  return res.data
}

export async function me() {
  const res = await API.get('/api/auth/me')
  return res.data
}
