import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasPermission, ROLES, ACTIONS } from '@/lib/auth/permissions';

export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const result = await executeQuery(
      `SELECT so.service_office_id, so.office_id, o.office_name, 
              so.is_process_owner, so.created_at
       FROM service_office so
       JOIN offices o ON so.office_id = o.office_id
       WHERE so.service_id = $1
       ORDER BY so.is_process_owner DESC, o.office_name`,
      [id]
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching service offices:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch service offices' }, { status: 500 });
  }
}

export async function POST(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { office_id, is_process_owner } = body;
    
    if (!office_id) {
      return NextResponse.json({ success: false, error: 'office_id is required' }, { status: 400 });
    }
    
    const existingAssociations = await executeQuery(
      'SELECT service_office_id FROM service_office WHERE service_id = $1 AND office_id = $2',
      [id, office_id]
    );
    
    if (existingAssociations.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'This office is already associated with this service' }, { status: 400 });
    }
    
    if (is_process_owner) {
      await executeQuery(
        'UPDATE service_office SET is_process_owner = FALSE WHERE service_id = $1',
        [id]
      );
    }
    
    const result = await executeQuery(
      'INSERT INTO service_office (service_id, office_id, is_process_owner) VALUES ($1, $2, $3) RETURNING *',
      [id, office_id, is_process_owner || false]
    );
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding service office:', error);
    return NextResponse.json({ success: false, error: 'Failed to add service office' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { service_office_id, is_process_owner } = body;
    
    if (!service_office_id) {
      return NextResponse.json({ success: false, error: 'service_office_id is required' }, { status: 400 });
    }
    
    const association = await executeQuery(
      'SELECT * FROM service_office WHERE service_office_id = $1 AND service_id = $2',
      [service_office_id, id]
    );
    
    if (association.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service office association not found' }, { status: 404 });
    }
    
    if (is_process_owner) {
      await executeQuery(
        'UPDATE service_office SET is_process_owner = FALSE WHERE service_id = $1 AND service_office_id != $2',
        [id, service_office_id]
      );
    }
    
    const result = await executeQuery(
      'UPDATE service_office SET is_process_owner = $1 WHERE service_office_id = $2 AND service_id = $3 RETURNING *',
      [is_process_owner || false, service_office_id, id]
    );
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating service office:', error);
    return NextResponse.json({ success: false, error: 'Failed to update service office' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { service_office_id } = body;
    
    if (!service_office_id) {
      return NextResponse.json({ success: false, error: 'service_office_id is required' }, { status: 400 });
    }
    
    const result = await executeQuery(
      'DELETE FROM service_office WHERE service_office_id = $1 AND service_id = $2 RETURNING *',
      [service_office_id, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service office association not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting service office:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete service office' }, { status: 500 });
  }
}