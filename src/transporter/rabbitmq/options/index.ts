import * as DotEnv from 'dotenv'

DotEnv.config()

export default {
  url: process.env.RABBITMQ_URL || null,
  hostname: process.env.RABBITMQ_HOSTNAME || 'localhost',
  port: Number.isNaN(Number(process.env.RABBITMQ_PORT))
    ? 5672
    : Number(process.env.RABBITMQ_PORT),
  username: process.env.RABBITMQ_USERNAME || 'rabbitmq',
  password: process.env.RABBITMQ_PASSWORD || 'rabbitmq',
}
