import pool from './database'

export async function executeQuery(query, values = []) {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(query, values)
      return result
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}