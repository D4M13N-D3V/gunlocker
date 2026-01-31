// Logger utility for Gun Locker
// Set LOG_LEVEL in localStorage to control verbosity: 'debug', 'info', 'warn', 'error'

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const getLogLevel = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('LOG_LEVEL') || 'debug'
  }
  return 'debug'
}

const shouldLog = (level) => {
  const currentLevel = LOG_LEVELS[getLogLevel()] || 0
  return LOG_LEVELS[level] >= currentLevel
}

const formatMessage = (level, category, message, data) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`
  return { prefix, message, data }
}

const logger = {
  debug: (category, message, data = null) => {
    if (shouldLog('debug')) {
      const { prefix } = formatMessage('debug', category, message, data)
      if (data) {
        console.log(`%c${prefix}%c ${message}`, 'color: #888', 'color: inherit', data)
      } else {
        console.log(`%c${prefix}%c ${message}`, 'color: #888', 'color: inherit')
      }
    }
  },

  info: (category, message, data = null) => {
    if (shouldLog('info')) {
      const { prefix } = formatMessage('info', category, message, data)
      if (data) {
        console.info(`%c${prefix}%c ${message}`, 'color: #2196F3', 'color: inherit', data)
      } else {
        console.info(`%c${prefix}%c ${message}`, 'color: #2196F3', 'color: inherit')
      }
    }
  },

  warn: (category, message, data = null) => {
    if (shouldLog('warn')) {
      const { prefix } = formatMessage('warn', category, message, data)
      if (data) {
        console.warn(`%c${prefix}%c ${message}`, 'color: #FF9800', 'color: inherit', data)
      } else {
        console.warn(`%c${prefix}%c ${message}`, 'color: #FF9800', 'color: inherit')
      }
    }
  },

  error: (category, message, data = null) => {
    if (shouldLog('error')) {
      const { prefix } = formatMessage('error', category, message, data)
      if (data) {
        console.error(`%c${prefix}%c ${message}`, 'color: #F44336', 'color: inherit', data)
      } else {
        console.error(`%c${prefix}%c ${message}`, 'color: #F44336', 'color: inherit')
      }
    }
  },

  // Log API requests/responses
  api: (method, endpoint, data = null, response = null) => {
    if (shouldLog('debug')) {
      const timestamp = new Date().toISOString()
      console.groupCollapsed(`%c[${timestamp}] [API] ${method} ${endpoint}`, 'color: #4CAF50')
      if (data) console.log('Request:', data)
      if (response) console.log('Response:', response)
      console.groupEnd()
    }
  },

  // Log auth events
  auth: (event, data = null) => {
    logger.info('Auth', event, data)
  },

  // Log navigation
  nav: (from, to) => {
    logger.debug('Navigation', `${from} -> ${to}`)
  },

  // Log component lifecycle
  component: (name, event, data = null) => {
    logger.debug('Component', `${name}: ${event}`, data)
  },

  // Log mutations (create, update, delete)
  mutation: (collection, action, data = null) => {
    logger.info('Mutation', `${action} ${collection}`, data)
  },

  // Log queries
  query: (collection, params = null) => {
    logger.debug('Query', `Fetching ${collection}`, params)
  },
}

// Log app startup
logger.info('App', 'Gun Locker initialized', {
  version: '1.0.0',
  env: import.meta.env.MODE,
  logLevel: getLogLevel(),
})

export default logger
