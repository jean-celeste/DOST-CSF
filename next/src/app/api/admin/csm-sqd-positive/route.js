import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    verifyToken(authHeader.replace('Bearer ', ''));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const query = 'SELECT * FROM csm_sqd_positive_percentage ORDER BY question_id;';
    const result = await executeQuery(query);
    return NextResponse.json({ 
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/csm-sqd-positive:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch SQD stats',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 