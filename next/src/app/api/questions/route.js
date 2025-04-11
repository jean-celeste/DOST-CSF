import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/utils'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')

    const query = `
      SELECT 
        q.question_id,
        q.question_text
      FROM questions q
      WHERE q.form_id = $1
      ORDER BY q.question_id
    `
    
    const result = await executeQuery(query, [formId])
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
} 