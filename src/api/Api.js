import axios from 'axios'

// Default backend URL: point to local Express server (port 4000)
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000' })

// Attach auth token from localStorage if present
API.interceptors.request.use((config) => {
	try {
		const token = localStorage.getItem('token')
		if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
	} catch (e) {
		// ignore
	}
	return config
})

export default API

// Fetch a random word for word-guess. Returns shape similar to older code: { data: { id, word, description } }
export const fetchRandomWord = async () => {
	const res = await API.get('/api/games/word-guess/words')
	const rows = res.data || []
	const pick = rows.length ? rows[Math.floor(Math.random() * rows.length)] : { id: null, word: 'APPLE', description: 'A fruit' }
	return { data: pick }
}

// Generic stubs for other games - they will call conventional endpoints if implemented on the server
export const startMemory = () => API.get('/api/games/memory-card/start')
export const fetchMathQuestions = () => API.get('/api/questions/math-quiz')
export const fetchTypingPassage = () => API.get('/api/typing/passage')
export const fetchScramble = () => API.get('/api/games/word-scramble/words')
export const fetchQuiz = () => API.get('/api/games/quiz/questions')
export const fetchEmoji = () => API.get('/api/games/emoji-guess/words')
export const startWhack = () => API.get('/api/games/whack/start')
export const startSimon = () => API.get('/api/games/simon/start')

// Submit score: map to POST /api/scores
export const submitScore = (payload) => API.post('/api/scores', payload)

// Get leaderboard for a game
export const getLeaderboard = (game, limit = 10) => API.get('/api/scores', { params: { game, limit } })
