import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Get a single service by ID
export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
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
        s.is_archived,
        s.archived_at,
        st.service_type_name,
        s.office_id AS unit_id,
        u.office_name AS unit_name,
        u.division_id,
        d.division_name,
        u.parent_office_id,
COALESCE(
           (SELECT json_agg(
             json_build_object(
               'service_office_id', so.service_office_id,
               'office_id', so.office_id,
               'office_name', o.office_name,
               'office_category', o.office_category,
               'is_process_owner', so.is_process_owner
             )
           ) FROM service_office so
           JOIN offices o ON so.office_id = o.office_id
           WHERE so.service_id = s.service_id),
           '[]'::json
         ) AS office_associations
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      LEFT JOIN offices u ON s.office_id = u.office_id AND u.office_category = 'unit'
      LEFT JOIN division d ON u.division_id = d.division_id
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
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { service_name, description, service_type_id, unit_id, client_types, office_associations } = body;
    if (!service_name || !service_type_id || !office_associations || office_associations.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Validate exactly one process owner
    const processOwners = office_associations.filter(o => o.is_process_owner);
    if (processOwners.length !== 1) {
      return NextResponse.json({ success: false, error: 'Exactly one office must be designated as process owner' }, { status: 400 });
    }
    const primaryOfficeId = processOwners[0].office_id;
    const operationalOfficeId = unit_id ? parseInt(String(unit_id), 10) : primaryOfficeId;
    const updateQuery = `
      UPDATE services
      SET service_name = $1, description = $2, service_type_id = $3, office_id = $4
      WHERE service_id = $5
      RETURNING *
    `;
    const values = [service_name, description || null, service_type_id, operationalOfficeId, id];
    const result = await executeQuery(updateQuery, values);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    const updatedService = result.rows[0];
    // Update service_office associations
    await executeQuery('DELETE FROM service_office WHERE service_id = $1', [id]);
    for (const assoc of office_associations) {
      await executeQuery(
        'INSERT INTO service_office (service_id, office_id, is_process_owner) VALUES ($1, $2, $3)',
        [id, assoc.office_id, assoc.is_process_owner || false]
      );
    }
    // Update service_client_type mapping
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
    const archiveQuery = `
      UPDATE services
      SET is_archived = true,
          archived_at = COALESCE(archived_at, NOW())
      WHERE service_id = $1
      RETURNING *
    `;
    const result = await executeQuery(archiveQuery, [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error archiving service:', error);
    return NextResponse.json({ success: false, error: 'Failed to archive service' }, { status: 500 });
  }
} 