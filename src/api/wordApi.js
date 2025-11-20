import API from './Api'
import { logger, LogTags } from '../lib/logger'

export async function fetchWords(game = 'word-guess') {
  try {
    logger.debug('Fetching words for game', { game }, LogTags.WORD_GUESS)
    // Map game name to correct endpoint
    const endpoint = game === 'word-guess' ? 'word' : encodeURIComponent(game)
    const res = await API.get(`/api/games/${endpoint}/words`)
    logger.debug('Words fetched successfully', { game, count: res.data?.length }, LogTags.WORD_GUESS)
    return res.data
  } catch (error) {
    logger.error('Failed to fetch words', error, { game }, LogTags.WORD_GUESS)
    throw error
  }
}
