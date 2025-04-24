import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/utils'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')

    if (!formId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Form ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const query = `
      SELECT 
        q.question_id,
        q.question_text
      FROM questions q
      WHERE q.form_id = $1
      ORDER BY q.question_id
    `
    
    const result = await executeQuery(query, [formId])
    const questions = result.rows.reduce((acc, row) => {
      acc[row.question_id] = row.question_text
      return acc
    }, {})

    return NextResponse.json({ 
      success: true,
      data: questions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in GET /api/questions:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch questions',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 