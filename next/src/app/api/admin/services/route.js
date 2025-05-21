import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: List all services (with joins)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const query = `
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.service_type_id,
        st.service_type_name,
        s.office_id,
        o.office_name,
        s.unit_id,
        u.unit_name
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      LEFT JOIN offices o ON s.office_id = o.office_id
      LEFT JOIN unit u ON s.unit_id = u.unit_id
      ORDER BY s.service_name
    `;
    const result = await executeQuery(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST: Create a new service
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { service_name, description, service_type_id, office_id, unit_id } = body;
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
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 500 });
  }
} 