import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { signToken } from './auth.js'
import { createUserStore } from './users.js'

const SECRET = 'test-secret-that-is-at-least-32-characters'
const PASSWORD = 'correct horse battery'
let app, users

async function signup(email) {
  const res = await request(app).post('/api/auth/register').send({ name: 'Test', email, password: PASSWORD })
  return res.body
}
async function adminToken() {
  const { user } = await signup('admin@example.com')
  users.setRole(user.id, 'admin')
  return signToken(user, SECRET)
}

beforeEach(() => {
  users = createUserStore()
  app = createApp({ jwtSecret: SECRET, users, rateLimitMax: 1000 })
})

describe('config', () => {
  it('refuses to start without a strong secret', () => {
    expect(() => loadConfig({})).toThrow()
    expect(() => loadConfig({ JWT_SECRET: 'short' })).toThrow()
    expect(loadConfig({ JWT_SECRET: SECRET }).jwtSecret).toBe(SECRET)
  })
})

describe('accounts', () => {
  it('registers as a customer even if the request asks for admin', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@example.com', password: PASSWORD, role: 'admin' })
    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('customer')
    expect(JSON.stringify(res.body)).not.toContain('hash')
  })

  it('rejects weak passwords and bad emails', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'nope', password: 'short' })
    expect(res.status).toBe(400)
    expect(res.body.fields).toEqual(['email', 'password'])
  })

  it('gives the same answer for a wrong email and a wrong password', async () => {
    await signup('a@example.com')
    const wrongPass = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'wrong password!!' })
    const wrongEmail = await request(app).post('/api/auth/login').send({ email: 'b@example.com', password: PASSWORD })
    expect(wrongPass.status).toBe(401)
    expect(wrongEmail.body).toEqual(wrongPass.body)
  })

  it('rejects tampered, foreign and "none" tokens', async () => {
    const { token } = await signup('a@example.com')
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa')
    const [, payload] = token.split('.')
    const unsigned = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${payload}.`
    for (const t of [tampered, unsigned]) {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${t}`)
      expect(res.status).toBe(401)
    }
  })

  it('rate-limits login attempts', async () => {
    const limited = createApp({ jwtSecret: SECRET, users, rateLimitMax: 3 })
    const codes = []
    for (let i = 0; i < 4; i++) {
      codes.push((await request(limited).post('/api/auth/login').send({ email: 'x@example.com', password: 'x' })).status)
    }
    expect(codes).toEqual([401, 401, 401, 429])
  })
})

describe('admin routes', () => {
  it('blocks product changes without login or without admin role', async () => {
    const product = { name: 'Phone stand', price: 1490 }
    expect((await request(app).post('/api/products').send(product)).status).toBe(401)
    const { token } = await signup('c@example.com')
    expect((await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(product)).status).toBe(403)
  })

  it('lets an admin add products and ignores extra fields', async () => {
    const token = await adminToken()
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'Phone stand', price: 1490, isFree: true })
    expect(res.status).toBe(201)
    expect(Object.keys(res.body).sort()).toEqual(['id', 'name', 'price'])
  })

  it('takes away access as soon as an admin is demoted', async () => {
    const token = await adminToken()
    const admin = users.list().find((u) => u.email === 'admin@example.com')
    users.setRole(admin.id, 'customer')
    expect((await request(app).get('/api/users').set('Authorization', `Bearer ${token}`)).status).toBe(403)
  })

  it('does not let an admin change their own role', async () => {
    const token = await adminToken()
    const admin = users.list()[0]
    const res = await request(app).put(`/api/users/${admin.id}/role`).set('Authorization', `Bearer ${token}`).send({ role: 'customer' })
    expect(res.status).toBe(400)
  })

  it('answers broken JSON without leaking internals', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Invalid JSON' })
  })
})
