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
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get('office_id');
    let query = 'SELECT unit_id, unit_name, office_id FROM unit';
    let values = [];
    if (officeId) {
      query += ' WHERE office_id = $1';
      values.push(officeId);
    }
    query += ' ORDER BY unit_name';
    const result = await executeQuery(query, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch units' }, { status: 500 });
  }
} 