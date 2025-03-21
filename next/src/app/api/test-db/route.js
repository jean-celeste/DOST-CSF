import pool from '@/lib/db/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Successfully connected to PostgreSQL database!' 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 })
  }
}