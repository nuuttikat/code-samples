// Settings come only from the environment. No default secret: if JWT_SECRET is missing or
// short, the app refuses to start instead of quietly signing tokens with a guessable key.
export function loadConfig(env = process.env) {
  const secret = env.JWT_SECRET || ''
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long.')
  }
  return { jwtSecret: secret, port: Number(env.PORT) || 3000 }
}
