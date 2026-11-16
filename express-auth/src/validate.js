// Small, strict input checks. Anything unexpected is rejected, never "fixed" silently.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/

export function signupErrors(body) {
  const { name, email, password } = body || {}
  const errors = []
  if (typeof name !== 'string' || name.trim().length < 1 || name.length > 100) errors.push('name')
  if (typeof email !== 'string' || !EMAIL.test(email)) errors.push('email')
  if (typeof password !== 'string' || password.length < 12 || password.length > 72) errors.push('password')
  return errors
}

export function productErrors(body) {
  const { name, price } = body || {}
  const errors = []
  if (typeof name !== 'string' || name.trim().length < 1 || name.length > 200) errors.push('name')
  if (!Number.isInteger(price) || price < 0 || price > 10_000_000) errors.push('price')
  return errors
}

export const ROLES = ['customer', 'subadmin', 'admin']
