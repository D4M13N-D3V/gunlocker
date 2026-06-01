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
  // Never log the raw auth token, even at debug level.
  const safeData =
    data && typeof data === 'object' && 'token' in data
      ? { ...data, token: '[REDACTED]' }
      : data
  logger[statusColor]('PocketBase', `Response: ${status}`, safeData)

  // A stale/invalid token (e.g. tokenKey rotated, or the instance was reseeded)
  // still looks valid locally (authStore.isValid only checks JWT expiry), so the
  // server silently treats us as anonymous. Detect that and clear the session so
  // the route guard bounces the user to login instead of letting every write
  // fail with an opaque "Failed to create record."
  //
  // - Auth-required endpoints (authRefresh, files/token) answer with a 401.
  // - Record writes degrade to anonymous and fail the API rule with a 400/403
  //   whose error envelope carries an EMPTY `data` (genuine field-validation
  //   errors populate it), so we revalidate the token and let the 401 branch
  //   above clear it. Note `data` here is the full body ({data, message,
  //   status}), so the field errors live at `data.data`.
  if (pb.authStore.token) {
    if (status === 401) {
      logger.auth('Session rejected by server (401) - clearing stale auth')
      pb.authStore.clear()
    } else if (status === 400 || status === 403) {
      const fieldErrors = data && typeof data === 'object' ? data.data : null
      const noFieldErrors = !fieldErrors || Object.keys(fieldErrors).length === 0
      if (noFieldErrors) revalidateSession()
    }
  }

  return data
}

// Confirm the current token is still accepted by the server. Runs at most once
// at a time; on failure authRefresh itself returns 401, which the afterSend
// handler above turns into an authStore.clear().
let revalidating = false
async function revalidateSession() {
  if (revalidating || !pb.authStore.token) return
  revalidating = true
  try {
    await pb.collection('users').authRefresh()
  } catch {
    // afterSend already cleared the session on the 401.
  } finally {
    revalidating = false
  }
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

// Returns the current user's id, throwing a clear error if the session has
// expired/cleared. Prefer authStore.record (authStore.model is deprecated).
export const getUserId = () => {
  const id = pb.authStore.record?.id || pb.authStore.model?.id
  if (!id) {
    throw new Error('You must be signed in to do that')
  }
  return id
}

// File fields are `protected`, so file URLs need a short-lived file token
// appended (?token=...). The token is fetched/refreshed by AuthProvider and
// mirrored here so the synchronous getFileUrl() callers keep working.
let fileToken = ''
export const setFileToken = (token) => {
  fileToken = token || ''
}

export const getFileUrl = (record, filename, options = {}) => {
  if (!record || !filename) return null
  const opts = fileToken ? { ...options, token: fileToken } : options
  return pb.files.getURL(record, filename, opts)
}

export const getThumbUrl = (record, filename, thumb = '100x100') => {
  return getFileUrl(record, filename, { thumb })
}
