const crypto = require('node:crypto')
const fs = require('node:fs')

const ROLES = ['Recepcionista', 'Veterinario', 'Administrador']
const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/
const DEVELOPMENT_USERS = [
  { username: 'admin', nombre: 'Administración', rol: 'Administrador', password: 'admin123' },
  { username: 'recepcionista', nombre: 'Recepción', rol: 'Recepcionista', password: 'recepcionista123' },
  { username: 'veterinario', nombre: 'Veterinaria', rol: 'Veterinario', password: 'veterinario123' },
]

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

function verifyPassword(password, storedHash) {
  const [algorithm, salt, expectedHex] = String(storedHash ?? '').split(':')
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(salt ?? '') || !/^[a-f0-9]{128}$/i.test(expectedHex ?? '')) {
    return false
  }

  const expected = Buffer.from(expectedHex, 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length)
  return crypto.timingSafeEqual(actual, expected)
}

function createUserRecord({ username, nombre, rol, password }) {
  const normalizedUsername = String(username ?? '').trim().toLowerCase()
  const normalizedName = String(nombre ?? '').trim()
  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    throw new Error('El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo.')
  }
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new Error('El nombre debe tener entre 2 y 80 caracteres.')
  }
  if (!ROLES.includes(rol)) {
    throw new Error('Selecciona un rol válido.')
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new Error('La contraseña debe tener entre 8 y 128 caracteres.')
  }

  return {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    nombre: normalizedName,
    rol,
    passwordHash: hashPassword(password),
  }
}

function readUsers(filePath) {
  if (!fs.existsSync(filePath)) return []

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!data || !Array.isArray(data.users)) {
    throw new Error(`El archivo de usuarios ${filePath} no tiene el formato esperado.`)
  }
  if (data.users.some((user) =>
    !user ||
    typeof user.id !== 'string' ||
    typeof user.username !== 'string' ||
    typeof user.nombre !== 'string' ||
    !ROLES.includes(user.rol) ||
    typeof user.passwordHash !== 'string'
  )) {
    throw new Error(`El archivo de usuarios ${filePath} contiene una cuenta inválida.`)
  }
  return data.users
}

function initializeDevelopmentUsers(filePath, isProduction) {
  if (isProduction || fs.existsSync(filePath)) return

  const users = DEVELOPMENT_USERS.map((user) => createUserRecord(user))
  fs.mkdirSync(require('node:path').dirname(filePath), { recursive: true })
  writeUsers(filePath, users)
  console.warn('Se crearon cuentas de demostración locales. No uses estas credenciales en producción.')
}

function writeUsers(filePath, users) {
  fs.writeFileSync(filePath, `${JSON.stringify({ users }, null, 2)}\n`, { mode: 0o600 })
}

function publicUser(user) {
  return { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol }
}

module.exports = {
  ROLES,
  createUserRecord,
  initializeDevelopmentUsers,
  publicUser,
  readUsers,
  verifyPassword,
  writeUsers,
}
