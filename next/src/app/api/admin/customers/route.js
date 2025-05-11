import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

const fetchClients = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.client_id,
        c.name,
        c.email,
        c.phone,
        c.sex,
        c.age,
        c.last_updated,
        ct.client_type_name,
        ect.external_type_name
      FROM 
        client c
      LEFT JOIN 
        client_type ct ON c.client_type_id = ct.client_type_id
      LEFT JOIN 
        external_client_type ect ON c.external_type_id = ect.external_type_id
      ORDER BY 
        c.last_updated DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Database error in fetchClients:', error);
    throw new Error('Failed to fetch clients from database');
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
    const clients = await fetchClients();
    return NextResponse.json({ 
      success: true,
      data: { clients },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch clients',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 