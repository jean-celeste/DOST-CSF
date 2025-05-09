import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

const fetchResponses = async () => {
  try {
    const query = `
      SELECT * FROM response_view
      ORDER BY submitted_at DESC;
    `;

    const result = await executeQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Database error in fetchResponses:', error);
    throw new Error('Failed to fetch responses from database');
  }
};

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
    const responses = await fetchResponses();
    return NextResponse.json({ 
      success: true,
      data: responses,  // Return the array directly
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/responses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch responses',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}