import axios from 'axios'
import { logger, LogTags } from '../lib/logger'

// Default backend URL: point to local Express server (port 4000)
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000' })

// Attach auth token from localStorage if present
API.interceptors.request.use((config) => {
	try {
		const token = localStorage.getItem('token')
		if (token) {
			config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
			logger.debug('Auth token attached to request', { url: config.url }, LogTags.TOKEN_MANAGER)
		}
	} catch (e) {
		logger.error('Error attaching auth token', e, {}, LogTags.TOKEN_MANAGER)
	}
	return config
})

// Response interceptor for logging
API.interceptors.response.use(
	(response) => {
		logger.debug('API response received', { url: response.config.url, status: response.status }, LogTags.TOKEN_MANAGER)
		return response
	},
	(error) => {
		logger.error('API request failed', error, { url: error.config?.url, status: error.response?.status }, LogTags.TOKEN_MANAGER)
		return Promise.reject(error)
	}
)

export default API

// Fetch a random word for word-guess. Returns shape similar to older code: { data: { id, word, description } }
export const fetchRandomWord = async () => {
	try {
		logger.debug('Fetching random word', {}, LogTags.WORD_GUESS)
		const res = await API.get('/api/games/word/words')
		const rows = res.data || []
		const pick = rows.length ? rows[Math.floor(Math.random() * rows.length)] : { id: null, word: 'APPLE', description: 'A fruit' }
		logger.debug('Random word fetched', { word: pick.word }, LogTags.WORD_GUESS)
		return { data: pick }
	} catch (error) {
		logger.error('Failed to fetch random word', error, {}, LogTags.WORD_GUESS)
		throw error
	}
}

// Generic stubs for other games - they will call conventional endpoints if implemented on the server
export const startMemory = () => {
	try {
		logger.debug('Starting memory game', {}, LogTags.MEMORY_CARD)
		return API.get('/api/games/memory-card/start')
	} catch (error) {
		logger.error('Failed to start memory game', error, {}, LogTags.MEMORY_CARD)
		throw error
	}
}

export const fetchMathQuestions = () => {
	try {
		logger.debug('Fetching math questions', {}, LogTags.MATH_QUIZ)
		return API.get('/api/games/math/questions')
	} catch (error) {
		logger.error('Failed to fetch math questions', error, {}, LogTags.MATH_QUIZ)
		throw error
	}
}

export const fetchTypingPassage = () => {
	try {
		logger.debug('Fetching typing passage', {}, LogTags.TYPING_TEST)
		return API.get('/api/typing/passage')
	} catch (error) {
		logger.error('Failed to fetch typing passage', error, {}, LogTags.TYPING_TEST)
		throw error
	}
}

export const fetchScramble = () => {
	try {
		logger.debug('Fetching scramble words', {}, LogTags.WORD_SCRAMBLE)
		return API.get('/api/games/word-scramble/words')
	} catch (error) {
		logger.error('Failed to fetch scramble words', error, {}, LogTags.WORD_SCRAMBLE)
		throw error
	}
}

export const fetchQuiz = () => {
	try {
		logger.debug('Fetching quiz questions', {}, LogTags.QUIZ)
		return API.get('/api/games/quiz/questions')
	} catch (error) {
		logger.error('Failed to fetch quiz questions', error, {}, LogTags.QUIZ)
		throw error
	}
}

export const fetchEmoji = () => {
	try {
		logger.debug('Fetching emoji puzzle', {}, LogTags.EMOJI_GUESS)
		return API.get('/api/games/emoji/start')
	} catch (error) {
		logger.error('Failed to fetch emoji puzzle', error, {}, LogTags.EMOJI_GUESS)
		throw error
	}
}

export const startWhack = () => {
	try {
		logger.debug('Starting whack-a-mole game', {}, LogTags.WHACK_MOLE)
		return API.get('/api/games/whack/start')
	} catch (error) {
		logger.error('Failed to start whack-a-mole game', error, {}, LogTags.WHACK_MOLE)
		throw error
	}
}

export const startSimon = () => {
	try {
		logger.debug('Starting simon says game', {}, LogTags.SIMON_SAYS)
		return API.get('/api/games/simon/start')
	} catch (error) {
		logger.error('Failed to start simon says game', error, {}, LogTags.SIMON_SAYS)
		throw error
	}
}

// Submit score: map to POST /api/scores
export const submitScore = (payload) => {
	try {
		logger.info('Submitting score', payload, LogTags.SAVE_SCORE)
		return API.post('/api/scores', payload)
	} catch (error) {
		logger.error('Failed to submit score', error, payload, LogTags.SAVE_SCORE)
		throw error
	}
}

// Get leaderboard for a game
export const getLeaderboard = (game, limit = 10) => {
	try {
		logger.debug('Fetching leaderboard', { game, limit }, LogTags.LEADERBOARD)
		return API.get('/api/scores', { params: { game, limit } })
	} catch (error) {
		logger.error('Failed to fetch leaderboard', error, { game, limit }, LogTags.LEADERBOARD)
		throw error
	}
}
