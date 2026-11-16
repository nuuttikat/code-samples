import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createUserStore } from './users.js'

const config = loadConfig()
const app = createApp({ jwtSecret: config.jwtSecret, users: createUserStore() })
app.listen(config.port, () => console.log(`Listening on http://localhost:${config.port}`))
