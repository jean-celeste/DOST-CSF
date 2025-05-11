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
    const query = 'SELECT service_type_id, service_type_name FROM services_types ORDER BY service_type_name';
    const result = await executeQuery(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching service types:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch service types' }, { status: 500 });
  }
} 