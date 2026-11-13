const fs = require('node:fs')
const path = require('node:path')
const readline = require('node:readline/promises')
const { stdin, stdout } = require('node:process')
const { createUserRecord, readUsers, writeUsers, ROLES } = require('./auth.cjs')

const USERS_FILE = path.resolve(__dirname, '..', 'auth-users.json')

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Ejecuta este comando desde una terminal interactiva para proteger la contraseña.'))
  }

  return new Promise((resolve, reject) => {
    let value = ''
    stdout.write(prompt)
    stdin.setRawMode(true)
    stdin.resume()

    const finish = (error) => {
      stdin.removeListener('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
      stdout.write('\n')
      if (error) reject(error)
      else resolve(value)
    }

    const onData = (chunk) => {
      const input = chunk.toString('utf8')
      for (const character of input) {
        if (character === '\u0003') return finish(new Error('Operación cancelada.'))
        if (character === '\r' || character === '\n') return finish()
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1)
        } else if (character >= ' ') {
          value += character
        }
      }
    }

    stdin.on('data', onData)
  })
}

async function main() {
  const prompt = readline.createInterface({ input: stdin, output: stdout })
  try {
    const username = await prompt.question('Usuario: ')
    const nombre = await prompt.question('Nombre: ')
    const rol = await prompt.question(`Rol (${ROLES.join(' / ')}): `)
    prompt.close()

    const password = await readHidden('Contraseña (mínimo 8 caracteres): ')
    const confirmation = await readHidden('Repite la contraseña: ')
    if (password !== confirmation) throw new Error('Las contraseñas no coinciden.')

    const users = readUsers(USERS_FILE)
    const user = createUserRecord({ username, nombre, rol, password })
    if (users.some((existing) => existing.username === user.username)) {
      throw new Error('Ya existe una cuenta con ese usuario.')
    }

    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
    writeUsers(USERS_FILE, [...users, user])
    stdout.write(`Cuenta creada para ${user.username} (${user.rol}).\n`)
  } finally {
    prompt.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
