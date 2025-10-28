import API from './Api'

export async function saveScore(payload) {
  const res = await API.post('/api/scores', payload)
  return res.data
}

export async function fetchScores(game = 'word-guess', limit = 10) {
  const res = await API.get('/api/scores', { params: { game, limit } })
  return res.data
}
