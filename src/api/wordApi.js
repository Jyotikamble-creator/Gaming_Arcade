import API from './Api'

export async function fetchWords(game = 'word-guess') {
  // Prefer using the axios instance which respects VITE_API_BASE if set
  const res = await API.get(`/api/games/${encodeURIComponent(game)}/words`)
  return res.data
}
