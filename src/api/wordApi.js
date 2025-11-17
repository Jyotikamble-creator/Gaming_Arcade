import API from './Api'

export async function fetchWords(game = 'word-guess') {
  // Map game name to correct endpoint
  const endpoint = game === 'word-guess' ? 'word' : encodeURIComponent(game)
  const res = await API.get(`/api/games/${endpoint}/words`)
  return res.data
}
