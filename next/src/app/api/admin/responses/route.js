import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

export async function GET() {
  try {
    // Fetch responses with related data
    const result = await pool.query(`
      SELECT 
        r.response_id,
        r.submitted_at,
        r.answers,
        c.customer_id,
        c.name,
        c.email,
        c.phone,
        c.sex,
        c.age,
        ct.cust_type_name,
        ect.external_type_name,
        s.service_name,
        f.form_title
      FROM 
        responses r
      LEFT JOIN 
        customer c ON r.customer_id = c.customer_id
      LEFT JOIN 
        customer_type ct ON c.customer_type_id = ct.cust_type_id
      LEFT JOIN 
        external_customer_type ect ON c.external_type_id = ect.external_type_id
      LEFT JOIN 
        services s ON r.service_id = s.service_id
      LEFT JOIN 
        forms f ON r.form_id = f.form_id
      ORDER BY 
        r.submitted_at DESC
    `);

    return NextResponse.json({ responses: result.rows });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
} 