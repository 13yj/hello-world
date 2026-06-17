import Fastify from 'fastify'
import { registerRoutes } from './routes.js'

const app = Fastify({ logger: true })

registerRoutes(app)

const start = async () => {
  const port = parseInt(process.env.PORT || '3000', 10)
  await app.listen({ port, host: '0.0.0.0' })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { app }
