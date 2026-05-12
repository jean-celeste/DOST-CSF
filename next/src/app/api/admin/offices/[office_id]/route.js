import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Get single office by ID
export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { office_id } = await context.params;
    const result = await executeQuery(
      'SELECT office_id, office_name, office_type_id, location, office_category, division_id, parent_office_id FROM offices WHERE office_id = $1',
      [office_id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching office:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch office' }, { status: 500 });
  }
}

// PUT: Update office
export async function PUT(request, context) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { office_id } = await context.params;
    const body = await request.json();
    const { office_name, office_type_id, location, office_category, division_id, parent_office_id } = body;

    if (!office_name || !office_type_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields: office_name, office_type_id' }, { status: 400 });
    }

    if (office_category && !['main', 'branch', 'unit'].includes(office_category)) {
      return NextResponse.json({ success: false, error: 'Invalid office_category: must be "main", "branch", or "unit"' }, { status: 400 });
    }

    const validCategory = office_category || 'main';

    const updateQuery = `
      UPDATE offices
      SET office_name = $1, office_type_id = $2, location = $3, office_category = $4, division_id = $5, parent_office_id = $6
      WHERE office_id = $7
      RETURNING *
    `;
    const result = await executeQuery(updateQuery, [
      office_name,
      office_type_id,
      location || null,
      validCategory,
      division_id ?? null,
      parent_office_id ?? null,
      office_id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating office:', error);
    return NextResponse.json({ success: false, error: 'Failed to update office' }, { status: 500 });
  }
}

// DELETE: Delete office
export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { office_id } = await context.params;
    const result = await executeQuery('DELETE FROM offices WHERE office_id = $1 RETURNING *', [office_id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting office:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete office' }, { status: 500 });
  }
}
