import jwt from 'jsonwebtoken'

// Short-lived tokens, one fixed algorithm, and the role is read fresh from the user store
// on every request, so a demoted or deleted user loses access right away.
const TOKEN_TTL = '1h'

export const signToken = (user, secret) =>
  jwt.sign({ sub: user.id }, secret, { algorithm: 'HS256', expiresIn: TOKEN_TTL })

export function requireAuth(secret, users) {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Login required' })
    try {
      const { sub } = jwt.verify(token, secret, { algorithms: ['HS256'] })
      const user = users.get(sub)
      if (!user) return res.status(401).json({ error: 'Login required' })
      req.user = user
      return next()
    } catch {
      return res.status(401).json({ error: 'Login required' })
    }
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Not allowed' })
