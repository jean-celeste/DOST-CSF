import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

export async function GET() {
  try {
    // Fetch customers with related data
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

    return NextResponse.json({ customers: result.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 