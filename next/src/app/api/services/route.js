import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/utils'

export async function GET(request) {
  try {
    // Get clientType from query params
    const { searchParams } = new URL(request.url)
    const clientType = searchParams.get('clientType')
    console.log('Received clientType:', clientType);

    // Map clientType string to client_type_id dynamically
    let clientTypeId = null
    if (clientType) {
      // Query the client_type table for the id
      const typeResult = await executeQuery(`SELECT client_type_id FROM client_type WHERE client_type_name = $1`, [clientType]);
      if (typeResult.rows.length > 0) {
        clientTypeId = typeResult.rows[0].client_type_id;
      }
    }
    console.log('Resolved clientTypeId:', clientTypeId);

    // Build query with optional filtering
    let query = `
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.service_type_id,
        st.service_type_name,
        proc.office_name AS office_name,
        unit.office_name AS unit_name,
        d.division_name
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      LEFT JOIN offices unit ON s.office_id = unit.office_id AND unit.office_category = 'unit'
      LEFT JOIN division d ON unit.division_id = d.division_id
      LEFT JOIN LATERAL (
        SELECT o.office_name
        FROM service_office so
        JOIN offices o ON so.office_id = o.office_id
        WHERE so.service_id = s.service_id AND so.is_process_owner = true
        LIMIT 1
      ) proc ON true
    `;
    if (clientTypeId) {
      query += ` INNER JOIN service_client_type sct ON s.service_id = sct.service_id WHERE sct.client_type_id = ${clientTypeId}`;
    }
    query += ' ORDER BY s.service_name';
    const result = await executeQuery(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'An error occurred while fetching services' }, { status: 500 });
  }
}