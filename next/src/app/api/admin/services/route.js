import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: List all services (with joins and service_office associations)
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
    `;
    const values = [];
    const conditions = [];
    if (role === 'Division Administrator' && division_id) {
      conditions.push(`(u.division_id = $1 OR EXISTS (
        SELECT 1 FROM service_office so2
        JOIN offices u2 ON so2.office_id = u2.parent_office_id
        WHERE so2.service_id = s.service_id AND u2.division_id = $1 AND u2.office_category = 'unit'
      ))`);
      values.push(division_id);
     } else if (role === 'Office Administrator' && office_id) {
      conditions.push('EXISTS (SELECT 1 FROM service_office so2 WHERE so2.service_id = s.service_id AND so2.office_id = $1)');
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
    const { service_name, description, service_type_id, unit_id, client_types, office_associations } = body;
    if (!service_name || !service_type_id || !office_associations || office_associations.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields: service_name, service_type_id, and office_associations are required' }, { status: 400 });
    }
    // Validate exactly one process owner
    const processOwners = office_associations.filter(o => o.is_process_owner);
    if (processOwners.length !== 1) {
      return NextResponse.json({ success: false, error: 'Exactly one office must be designated as process owner' }, { status: 400 });
    }
    // Create service with nullable office_id (first process owner office for backward compat)
    const primaryOfficeId = processOwners[0].office_id;
    const operationalOfficeId = unit_id ? parseInt(String(unit_id), 10) : primaryOfficeId;
    const insertQuery = `
      INSERT INTO services (service_name, description, service_type_id, office_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [service_name, description || null, service_type_id, operationalOfficeId];
    const result = await executeQuery(insertQuery, values);
    const newService = result.rows[0];
    // Insert service_office associations
    for (const assoc of office_associations) {
      await executeQuery(
        'INSERT INTO service_office (service_id, office_id, is_process_owner) VALUES ($1, $2, $3)',
        [newService.service_id, assoc.office_id, assoc.is_process_owner || false]
      );
    }
    // Insert into service_client_type for each client_type_id
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