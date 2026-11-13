const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { once } = require('node:events')
const test = require('node:test')
const { createUserRecord, initializeDevelopmentUsers, readUsers, verifyPassword, writeUsers } = require('./auth.cjs')
const { createServer } = require('./server.cjs')

test('creates demo users only for local development and never overwrites existing accounts', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'veterinaria-users-'))
  const usersFile = path.join(directory, 'auth-users.json')
  try {
    initializeDevelopmentUsers(usersFile, true)
    assert.equal(fs.existsSync(usersFile), false)

    initializeDevelopmentUsers(usersFile, false)
    const users = readUsers(usersFile)
    assert.deepEqual(users.map(({ username, rol }) => [username, rol]), [
      ['admin', 'Administrador'],
      ['recepcionista', 'Recepcionista'],
      ['veterinario', 'Veterinario'],
    ])
    assert.deepEqual(
      users.map(({ username, passwordHash }) => [username, verifyPassword({
        admin: 'admin123',
        recepcionista: 'recepcionista123',
        veterinario: 'veterinario123',
      }[username], passwordHash)]),
      [['admin', true], ['recepcionista', true], ['veterinario', true]],
    )
    const existingContent = fs.readFileSync(usersFile, 'utf8')
    initializeDevelopmentUsers(usersFile, false)
    assert.equal(fs.readFileSync(usersFile, 'utf8'), existingContent)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('enforces authentication and role permissions on the API', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'veterinaria-auth-'))
  const dbFile = path.join(directory, 'db.json')
  const usersFile = path.join(directory, 'users.json')
  fs.copyFileSync(path.resolve(__dirname, '..', 'db.json'), dbFile)
  writeUsers(usersFile, [
    createUserRecord({
      username: 'admin',
      nombre: 'Admin',
      rol: 'Administrador',
      password: 'admin123',
    }),
    createUserRecord({
      username: 'veterinario',
      nombre: 'Vet',
      rol: 'Veterinario',
      password: 'veterinario123',
    }),
    createUserRecord({
      username: 'recepcionista',
      nombre: 'Recepción',
      rol: 'Recepcionista',
      password: 'recepcionista123',
    }),
  ])

  const app = createServer({ dbFile, usersFile })
  const server = app.listen(0)
  await once(server, 'listening')
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  async function request(url, options = {}, cookie) {
    const headers = new Headers(options.headers)
    headers.set('Origin', 'http://127.0.0.1:5173')
    if (cookie) headers.set('Cookie', cookie)
    return fetch(`${baseUrl}${url}`, { ...options, headers })
  }

  async function login(username, password) {
    const response = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const cookie = response.headers.get('set-cookie')?.split(';', 1)[0]
    return { response, cookie }
  }

  try {
    assert.equal((await request('/mascotas')).status, 401)
    assert.equal((await request('/', {}, undefined)).status, 404)
    assert.equal((await fetch(`${baseUrl}/mascotas`, {
      headers: { Origin: 'https://not-allowed.example' },
    })).status, 403)
    assert.equal((await login('veterinario', 'incorrect-password')).response.status, 401)

    const { response: vetLogin, cookie: vetCookie } = await login('veterinario', 'veterinario123')
    assert.equal(vetLogin.status, 200)
    assert.ok(vetCookie)
    assert.match(vetLogin.headers.get('set-cookie'), /HttpOnly/)
    assert.match(vetLogin.headers.get('set-cookie'), /SameSite=Strict/)
    assert.match(vetLogin.headers.get('set-cookie'), /Max-Age=28800/)
    assert.equal((await request('/auth/me', {}, vetCookie)).status, 200)
    assert.equal((await request('/mascotas', {}, vetCookie)).status, 200)
    assert.equal((await request('/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: '2026-12-01', mascotaId: 1, servicioId: 1, estado: 'Pendiente' }),
    }, vetCookie)).status, 403)

    const appointment = {
      fecha: '2026-11-20',
      mascotaId: 1,
      servicioId: 2,
      estado: 'Atendida',
    }
    assert.equal((await request('/citas/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...appointment, fecha: '2026-12-01' }),
    }, vetCookie)).status, 403)
    assert.equal((await request('/citas/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    }, vetCookie)).status, 200)

    const { cookie: receptionistCookie } = await login('recepcionista', 'recepcionista123')
    assert.ok(receptionistCookie)
    assert.equal((await request('/duenos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Nuevo dueño', telefono: '999999999', email: 'nuevo@example.com' }),
    }, receptionistCookie)).status, 201)
    assert.equal((await request('/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Servicio no autorizado', precio: 1 }),
    }, receptionistCookie)).status, 403)

    const { cookie: adminCookie } = await login('admin', 'admin123')
    assert.ok(adminCookie)
    assert.equal((await request('/servicios', {}, adminCookie)).status, 200)

    assert.equal((await request('/auth/logout', { method: 'POST' }, vetCookie)).status, 204)
    assert.equal((await request('/auth/me', {}, vetCookie)).status, 401)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
