import { Pool } from 'pg'

let pool
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true'

if (!pool) {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT),
    ssl: useSsl ? { rejectUnauthorized: false } : false
  })
}

export default pool
