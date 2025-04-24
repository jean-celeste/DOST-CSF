import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

export async function GET() {
  try {
    const result = await executeQuery('SELECT NOW() as time');
    return NextResponse.json({ 
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to connect to database',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}