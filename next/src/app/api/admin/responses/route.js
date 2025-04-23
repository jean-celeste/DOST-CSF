import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

const fetchResponses = async () => {
  try {
    const query = `
      SELECT 
        r.response_id,
        r.submitted_at,
        r.answers,
        s.service_id,
        s.service_name,
        o.office_name,
        u.unit_name,
        c.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        ct.cust_type_name,
        ect.external_type_name,
        f.form_id,
        f.form_title as form_name,
        CASE 
          WHEN f.form_id IN (1, 2) THEN 'csm'
          WHEN f.form_id IN (3, 4) THEN 'qms'
          ELSE 'unknown'
        END as form_type
      FROM responses r
      JOIN services s ON r.service_id = s.service_id
      LEFT JOIN offices o ON s.office_id = o.office_id
      LEFT JOIN unit u ON s.unit_id = u.unit_id
      JOIN customer c ON r.customer_id = c.customer_id
      LEFT JOIN customer_type ct ON c.customer_type_id = ct.cust_type_id
      LEFT JOIN external_customer_type ect ON c.external_type_id = ect.external_type_id
      JOIN forms f ON r.form_id = f.form_id
      ORDER BY r.submitted_at DESC
    `;

    const result = await executeQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Database error in fetchResponses:', error);
    throw new Error('Failed to fetch responses from database');
  }
};

export async function GET() {
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