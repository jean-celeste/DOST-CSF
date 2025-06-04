import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Get a single service by ID
export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
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
      WHERE s.service_id = $1
    `;
    const result = await executeQuery(query, [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    const service = result.rows[0];
    // Fetch associated client types
    const clientTypesResult = await executeQuery('SELECT ct.client_type_id, ct.client_type_name FROM service_client_type sct JOIN client_type ct ON sct.client_type_id = ct.client_type_id WHERE sct.service_id = $1', [id]);
    service.client_types = clientTypesResult.rows;
    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch service' }, { status: 500 });
  }
}

// PUT: Update a service by ID
export async function PUT(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { service_name, description, service_type_id, office_id, unit_id, client_types } = body;
    if (!service_name || !service_type_id || !office_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const updateQuery = `
      UPDATE services
      SET service_name = $1, description = $2, service_type_id = $3, office_id = $4, unit_id = $5
      WHERE service_id = $6
      RETURNING *
    `;
    const values = [service_name, description, service_type_id, office_id, unit_id || null, id];
    const result = await executeQuery(updateQuery, values);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    const updatedService = result.rows[0];
    // Step 4: Update service_client_type mapping
    if (Array.isArray(client_types)) {
      // Remove all old mappings
      await executeQuery('DELETE FROM service_client_type WHERE service_id = $1', [id]);
      // Insert new mappings
      if (client_types.length > 0) {
        const insertClientTypePromises = client_types.map(clientTypeId =>
          executeQuery(
            'INSERT INTO service_client_type (service_id, client_type_id) VALUES ($1, $2)',
            [id, clientTypeId]
          )
        );
        await Promise.all(insertClientTypePromises);
      }
    }
    return NextResponse.json({ success: true, data: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ success: false, error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE: Remove a service by ID
export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const deleteQuery = 'DELETE FROM services WHERE service_id = $1 RETURNING *';
    const result = await executeQuery(deleteQuery, [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete service' }, { status: 500 });
  }
} 