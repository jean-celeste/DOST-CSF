import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: List all services (with joins)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { role, office_id, division_id } = session.user;
    let query = `
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.service_type_id,
        st.service_type_name,
        s.office_id,
        o.office_name,
        s.unit_id,
        u.unit_name,
        u.division_id
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      LEFT JOIN offices o ON s.office_id = o.office_id
      LEFT JOIN unit u ON s.unit_id = u.unit_id
    `;
    const values = [];
    const conditions = [];
    if (role === 'Division Administrator' && division_id) {
      conditions.push('u.division_id = $1');
      values.push(division_id);
    } else if (role === 'PSTO Administrator' && office_id) {
      conditions.push('s.office_id = $1');
      values.push(office_id);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY s.service_name';
    const result = await executeQuery(query, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST: Create a new service
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { service_name, description, service_type_id, office_id, unit_id, client_types } = body;
    if (!service_name || !service_type_id || !office_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const insertQuery = `
      INSERT INTO services (service_name, description, service_type_id, office_id, unit_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [service_name, description, service_type_id, office_id, unit_id || null];
    const result = await executeQuery(insertQuery, values);
    const newService = result.rows[0];
    // Step 4: Insert into service_client_type for each client_type_id
    if (Array.isArray(client_types) && client_types.length > 0) {
      const insertClientTypePromises = client_types.map(clientTypeId =>
        executeQuery(
          'INSERT INTO service_client_type (service_id, client_type_id) VALUES ($1, $2)',
          [newService.service_id, clientTypeId]
        )
      );
      await Promise.all(insertClientTypePromises);
    }
    return NextResponse.json({ success: true, data: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 500 });
  }
} 