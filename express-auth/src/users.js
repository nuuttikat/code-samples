import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

// In-memory user store so the sample runs without a database. A real app uses a database
// with parameterised queries; the rules below stay the same.
const BCRYPT_COST = 12
// Compared against when the email doesn't exist, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST)

export function createUserStore() {
  const users = new Map()

  const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })

  return {
    async register({ name, email, password }) {
      const key = email.toLowerCase()
      if ([...users.values()].some((u) => u.email === key)) return null
      // Everyone starts as a customer. Roles change only through an admin.
      const user = { id: randomUUID(), name, email: key, role: 'customer', hash: await bcrypt.hash(password, BCRYPT_COST) }
      users.set(user.id, user)
      return publicUser(user)
    },

    async verify(email, password) {
      const user = [...users.values()].find((u) => u.email === email.toLowerCase())
      const ok = await bcrypt.compare(password, user ? user.hash : DUMMY_HASH)
      return ok && user ? publicUser(user) : null
    },

    get: (id) => (users.has(id) ? publicUser(users.get(id)) : null),
    list: () => [...users.values()].map(publicUser),
    setRole(id, role) {
      const user = users.get(id)
      if (!user) return null
      user.role = role
      return publicUser(user)
    },
  }
}
