const crypto = require('node:crypto')
const path = require('node:path')
const express = require('express')
const jsonServer = require('json-server')
const { ROLES, createUserRecord, initializeDevelopmentUsers, publicUser, readUsers, verifyPassword } = require('./auth.cjs')

const SESSION_COOKIE = 'vet_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
const RESOURCE_NAMES = ['duenos', 'mascotas', 'citas', 'servicios']
const VALID_APPOINTMENT_STATES = ['Pendiente', 'Atendida', 'Cancelada']

function cookieValue(header, name) {
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim())
      } catch {
        return null
      }
    }
  }
  return null
}

function createServer({
  dbFile = path.resolve(__dirname, '..', 'db.json'),
  usersFile = path.resolve(__dirname, '..', 'auth-users.json'),
  allowedOrigins = (process.env.AUTH_ALLOWED_ORIGINS ?? DEFAULT_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  secureCookies = process.env.NODE_ENV === 'production' || process.env.AUTH_COOKIE_SECURE === 'true',
  isProduction = process.env.NODE_ENV === 'production',
} = {}) {
  initializeDevelopmentUsers(usersFile, isProduction)
  const app = jsonServer.create()
  const router = jsonServer.router(dbFile)
  const sessions = new Map()
  const loginAttempts = new Map()
  const allowedOriginSet = new Set(allowedOrigins)
  const dummyHash = createUserRecord({
    username: 'unknown',
    nombre: 'Dummy',
    rol: 'Administrador',
    password: crypto.randomBytes(24).toString('hex'),
  }).passwordHash

  app.disable('x-powered-by')
  app.use((req, res, next) => {
    const origin = req.get('Origin')
    if (origin && !allowedOriginSet.has(origin)) {
      return res.status(403).json({ error: 'Origen no permitido.' })
    }
    if (origin) {
      res.set('Access-Control-Allow-Origin', origin)
      res.set('Access-Control-Allow-Credentials', 'true')
      res.set('Vary', 'Origin')
    }
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.set('Access-Control-Allow-Headers', 'Content-Type')
      return res.status(204).end()
    }
    next()
  })
  app.use(express.json({ limit: '16kb' }))

  app.post('/auth/login', (req, res) => {
    res.set('Cache-Control', 'no-store')
    const ip = req.ip
    const now = Date.now()
    for (const [ipAddress, previousAttempt] of loginAttempts) {
      if (now - previousAttempt.startedAt >= LOGIN_WINDOW_MS) loginAttempts.delete(ipAddress)
    }
    const previous = loginAttempts.get(ip)
    const attempt = previous && now - previous.startedAt < LOGIN_WINDOW_MS
      ? previous
      : { startedAt: now, count: 0 }

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' })
    }

    const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' && req.body.password.length <= 128
      ? req.body.password
      : ''
    const user = readUsers(usersFile).find((candidate) => candidate.username === username)
    const passwordMatches = verifyPassword(password, user?.passwordHash ?? dummyHash)
    if (!user || !passwordMatches) {
      attempt.count += 1
      loginAttempts.set(ip, attempt)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }

    loginAttempts.delete(ip)
    const token = crypto.randomBytes(32).toString('base64url')
    sessions.set(token, { userId: user.id, expiresAt: now + SESSION_TTL_MS })
    const cookieParts = [
      `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    ]
    if (secureCookies) cookieParts.push('Secure')
    res.set('Set-Cookie', cookieParts.join('; '))
    return res.json(publicUser(user))
  })

  app.post('/auth/logout', (req, res) => {
    const token = cookieValue(req.get('Cookie'), SESSION_COOKIE)
    if (token) sessions.delete(token)
    res.set('Cache-Control', 'no-store')
    res.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookies ? '; Secure' : ''}`)
    return res.status(204).end()
  })

  function authenticate(req, res, next) {
    const token = cookieValue(req.get('Cookie'), SESSION_COOKIE)
    const session = token ? sessions.get(token) : null
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token)
      return res.status(401).json({ error: 'Inicia sesión para continuar.' })
    }

    const user = readUsers(usersFile).find((candidate) => candidate.id === session.userId)
    if (!user) {
      sessions.delete(token)
      return res.status(401).json({ error: 'La cuenta ya no está disponible. Inicia sesión de nuevo.' })
    }
    req.authUser = user
    req.sessionToken = token
    next()
  }

  app.get('/auth/me', authenticate, (req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json(publicUser(req.authUser))
  })

  app.use((req, res, next) => {
    const match = req.path.match(/^\/(duenos|mascotas|citas|servicios)(?:\/|$)/)
    if (!match || !RESOURCE_NAMES.includes(match[1])) {
      return res.status(404).json({ error: 'Ruta no encontrada.' })
    }

    return authenticate(req, res, (error) => {
      if (error) return next(error)
      const resource = match[1]
      const { rol } = req.authUser
      const isRead = req.method === 'GET'

      if (!ROLES.includes(rol)) return res.status(403).json({ error: 'El rol de esta cuenta no es válido.' })
      if (rol === 'Administrador') return next()
      if (isRead) return next()
      if (rol === 'Recepcionista' && resource !== 'servicios') return next()
      if (rol === 'Veterinario' && resource === 'citas' && req.method === 'PUT') {
        const idMatch = req.path.match(/^\/citas\/(\d+)$/)
        const current = idMatch
          ? router.db.get('citas').find({ id: Number(idMatch[1]) }).value()
          : null
        const body = req.body
        const fields = ['fecha', 'mascotaId', 'servicioId', 'estado']
        const unchangedAppointment = current &&
          body &&
          fields.every((field) => Object.hasOwn(body, field)) &&
          fields.filter((field) => field !== 'estado').every((field) => body[field] === current[field])
        if (unchangedAppointment && VALID_APPOINTMENT_STATES.includes(body.estado)) return next()
      }

      return res.status(403).json({ error: 'Tu rol no tiene permiso para esta operación.' })
    })
  })

  app.use(router)
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500
    if (status >= 500) console.error(error)
    res.status(status).json({ error: status === 400 ? 'La solicitud contiene JSON inválido.' : 'Error interno del servidor.' })
  })

  return app
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001)
  const host = process.env.HOST ?? '127.0.0.1'
  const app = createServer()
  app.listen(port, host, () => {
    console.log(`API protegida disponible en http://${host}:${port}`)
  })
}

module.exports = { createServer }
