import Fastify from 'fastify'
import { registerRoutes } from './routes.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

async function main() {
  const app = Fastify({ logger: true })

  registerRoutes(app)

  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`Tech Solution API listening on ${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()

export { main }
