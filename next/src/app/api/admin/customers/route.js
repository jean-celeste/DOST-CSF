import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

const fetchCustomers = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        c.phone,
        c.sex,
        c.age,
        c.last_updated,
        ct.cust_type_name,
        ect.external_type_name
      FROM 
        customer c
      LEFT JOIN 
        customer_type ct ON c.customer_type_id = ct.cust_type_id
      LEFT JOIN 
        external_customer_type ect ON c.external_type_id = ect.external_type_id
      ORDER BY 
        c.last_updated DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Database error in fetchCustomers:', error);
    throw new Error('Failed to fetch customers from database');
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
    const customers = await fetchCustomers();
    return NextResponse.json({ 
      success: true,
      data: { customers },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/customers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch customers',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 