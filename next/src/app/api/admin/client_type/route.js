import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    verifyToken(authHeader.replace('Bearer ', ''));
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
  try {
    const query = 'SELECT client_type_id, client_type_name FROM client_type ORDER BY client_type_name';
    const result = await executeQuery(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching client types:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch client types' }, { status: 500 });
  }
} 