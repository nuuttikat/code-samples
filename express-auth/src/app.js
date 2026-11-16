import { randomUUID } from 'node:crypto'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { requireAuth, requireRole, signToken } from './auth.js'
import { productErrors, ROLES, signupErrors } from './validate.js'

export function createApp({ jwtSecret, users, rateLimitMax = 10 }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(express.json({ limit: '10kb' }))

  const auth = requireAuth(jwtSecret, users)
  const adminOnly = [auth, requireRole('admin')]
  // Slows down password guessing: 10 tries per 15 minutes per IP.
  const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: rateLimitMax, standardHeaders: true, legacyHeaders: false })

  // ---------- accounts ----------
  app.post('/api/auth/register', loginLimit, async (req, res) => {
    const errors = signupErrors(req.body)
    if (errors.length) return res.status(400).json({ error: 'Invalid input', fields: errors })
    const user = await users.register(req.body)
    if (!user) return res.status(409).json({ error: 'Email already registered' })
    res.status(201).json({ user, token: signToken(user, jwtSecret) })
  })

  app.post('/api/auth/login', loginLimit, async (req, res) => {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Invalid input' })
    const user = await users.verify(email, password)
    // Same answer for a wrong email and a wrong password: no hint which accounts exist.
    if (!user) return res.status(401).json({ error: 'Wrong email or password' })
    res.json({ user, token: signToken(user, jwtSecret) })
  })

  app.get('/api/auth/me', auth, (req, res) => res.json(req.user))

  app.get('/api/users', adminOnly, (req, res) => res.json(users.list()))

  app.put('/api/users/:id/role', adminOnly, (req, res) => {
    const { role } = req.body || {}
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' })
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot change your own role' })
    const user = users.setRole(req.params.id, role)
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(user)
  })

  // ---------- products: anyone can read, only admins can change ----------
  const products = new Map()

  app.get('/api/products', (req, res) => res.json([...products.values()]))

  app.post('/api/products', adminOnly, (req, res) => {
    const errors = productErrors(req.body)
    if (errors.length) return res.status(400).json({ error: 'Invalid input', fields: errors })
    // Only known fields are copied, so a request can't slip in extra properties.
    const product = { id: randomUUID(), name: req.body.name.trim(), price: req.body.price }
    products.set(product.id, product)
    res.status(201).json(product)
  })

  app.delete('/api/products/:id', adminOnly, (req, res) => {
    if (!products.delete(req.params.id)) return res.status(404).json({ error: 'Not found' })
    res.status(204).end()
  })

  // Errors never leak stack traces or internals to the client.
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' })
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Too large' })
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  })

  return app
}
