import API from './Api'
import { logger, LogTags } from '../lib/logger'

export async function saveScore(payload) {
  try {
    logger.info('Saving score', payload, LogTags.SAVE_SCORE)
    const res = await API.post('/api/scores', payload)
    logger.info('Score saved successfully', { scoreId: res.data?.id }, LogTags.SAVE_SCORE)
    return res.data
  } catch (error) {
    logger.error('Failed to save score', error, payload, LogTags.SAVE_SCORE)
    throw error
  }
}

export async function fetchScores(game = 'word-guess', limit = 10) {
  try {
    logger.debug('Fetching scores', { game, limit }, LogTags.FETCH_SCORES)
    const res = await API.get('/api/scores', { params: { game, limit } })
    logger.debug('Scores fetched successfully', { game, count: res.data?.length }, LogTags.FETCH_SCORES)
    return res.data
  } catch (error) {
    logger.error('Failed to fetch scores', error, { game, limit }, LogTags.FETCH_SCORES)
    throw error
  }
}

export async function fetchMyScores(game) {
  try {
    logger.debug('Fetching my scores', { game }, LogTags.MY_SCORES)
    const res = await API.get('/api/scores/me', { params: { game } })
    logger.debug('My scores fetched successfully', { game, count: res.data?.length }, LogTags.MY_SCORES)
    return res.data
  } catch (error) {
    logger.error('Failed to fetch my scores', error, { game }, LogTags.MY_SCORES)
    throw error
  }
}

export async function fetchProgress() {
  try {
    logger.debug('Fetching user progress', {}, LogTags.FETCH_PROGRESS)
    const res = await API.get('/api/progress/me')
    logger.debug('User progress fetched successfully', { totalGames: res.data?.totalGames }, LogTags.FETCH_PROGRESS)
    return res.data
  } catch (error) {
    logger.error('Failed to fetch user progress', error, {}, LogTags.FETCH_PROGRESS)
    throw error
  }
}
