import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/utils'

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
    const query = `
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.service_type_id,
        st.service_type_name,
        o.office_name,
        u.unit_name
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      LEFT JOIN offices o ON s.office_id = o.office_id
      LEFT JOIN unit u ON s.unit_id = u.unit_id
      ORDER BY s.service_name
    `
    
    const result = await executeQuery(query)
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
} 