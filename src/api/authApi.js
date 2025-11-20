import API from './Api'
import { logger, LogTags } from '../lib/logger'

export async function signup({ email, password }) {
  try {
    logger.info('Attempting user signup', { email }, LogTags.REGISTER)
    const res = await API.post('/api/auth/signup', { email, password })
    logger.info('User signup successful', { email, userId: res.data.user?.id }, LogTags.REGISTER)
    return res.data
  } catch (error) {
    logger.error('User signup failed', error, { email }, LogTags.REGISTER)
    throw error
  }
}

export async function login({ email, password }) {
  try {
    logger.info('Attempting user login', { email }, LogTags.LOGIN)
    const res = await API.post('/api/auth/login', { email, password })
    logger.info('User login successful', { email, userId: res.data.user?.id }, LogTags.LOGIN)
    return res.data
  } catch (error) {
    logger.error('User login failed', error, { email }, LogTags.LOGIN)
    throw error
  }
}

export async function me() {
  try {
    logger.debug('Fetching current user info', {}, LogTags.SESSIONS)
    const res = await API.get('/api/auth/me')
    logger.debug('Current user info fetched', { userId: res.data.user?.id }, LogTags.SESSIONS)
    return res.data
  } catch (error) {
    logger.error('Failed to fetch current user info', error, {}, LogTags.SESSIONS)
    throw error
  }
}
