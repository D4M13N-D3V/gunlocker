import PocketBase from 'pocketbase'
import logger from './logger'

// In production, use same origin. In dev, use localhost:8090
const PB_URL = import.meta.env.VITE_POCKETBASE_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:8090')
const pb = new PocketBase(PB_URL)

pb.autoCancellation(false)

logger.info('PocketBase', `Client initialized`, { url: PB_URL })

// Add request/response interceptors for logging
pb.beforeSend = function (url, options) {
  const hasAuth = options.headers?.Authorization || pb.authStore.token
  logger.debug('PocketBase', `Request: ${options.method || 'GET'} ${url}`, {
    hasAuthToken: !!hasAuth,
    isAuthValid: pb.authStore.isValid,
    userId: pb.authStore.model?.id
  })
  return { url, options }
}

pb.afterSend = function (response, data) {
  const status = response.status
  const statusColor = status >= 400 ? 'error' : 'debug'
  logger[statusColor]('PocketBase', `Response: ${status}`, data)
  return data
}

// Log auth state changes
pb.authStore.onChange((token, model) => {
  if (token) {
    logger.auth('Auth state changed - User logged in', { email: model?.email, id: model?.id })
  } else {
    logger.auth('Auth state changed - User logged out')
  }
})

export default pb

export const getFileUrl = (record, filename, options = {}) => {
  if (!record || !filename) return null
  return pb.files.getURL(record, filename, options)
}

export const getThumbUrl = (record, filename, thumb = '100x100') => {
  return getFileUrl(record, filename, { thumb })
}
