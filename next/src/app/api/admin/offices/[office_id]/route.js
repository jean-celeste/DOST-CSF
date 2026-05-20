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
      `
        SELECT
          o.office_id,
          o.office_name,
          o.office_type_id,
          ot.type_name AS office_type_name,
          o.office_category,
          o.division_id,
          o.parent_office_id,
          o.is_archived,
          o.archived_at
        FROM offices o
        LEFT JOIN office_type ot ON o.office_type_id = ot.office_type_id
        WHERE o.office_id = $1
      `,
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
    const { office_name, office_type_id, office_category, division_id, parent_office_id } = body;

    if (!office_name || !office_type_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields: office_name, office_type_id' }, { status: 400 });
    }

    const parsedOfficeTypeId = Number.parseInt(String(office_type_id), 10);
    if (Number.isNaN(parsedOfficeTypeId)) {
      return NextResponse.json({ success: false, error: 'Invalid office_type_id' }, { status: 400 });
    }

    const typeCheck = await executeQuery('SELECT 1 FROM office_type WHERE office_type_id = $1', [parsedOfficeTypeId]);
    if (typeCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office type does not exist' }, { status: 400 });
    }

    if (office_category && !['main', 'branch', 'unit'].includes(office_category)) {
      return NextResponse.json({ success: false, error: 'Invalid office_category: must be "main", "branch", or "unit"' }, { status: 400 });
    }

    const validCategory = office_category || 'main';

    const updateQuery = `
      UPDATE offices
      SET office_name = $1, office_type_id = $2, office_category = $3, division_id = $4, parent_office_id = $5
      WHERE office_id = $6
      RETURNING *
    `;
    const result = await executeQuery(updateQuery, [
      office_name,
      parsedOfficeTypeId,
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
    const result = await executeQuery(
      `
        UPDATE offices
        SET is_archived = true,
            archived_at = COALESCE(archived_at, NOW())
        WHERE office_id = $1
        RETURNING *
      `,
      [office_id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error?.code === '23503') {
      return NextResponse.json({
        success: false,
        error: 'Office has linked services. Reassign or remove services before deleting.'
      }, { status: 409 });
    }
    console.error('Error deleting office:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete office' }, { status: 500 });
  }
}

// PATCH: Archive or restore office
export async function PATCH(request, context) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { office_id } = await context.params;
    const body = await request.json();
    const { is_archived } = body;
    if (typeof is_archived !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid is_archived value' }, { status: 400 });
    }

    const result = await executeQuery(
      `
        UPDATE offices
        SET is_archived = $1,
            archived_at = CASE WHEN $1 THEN COALESCE(archived_at, NOW()) ELSE NULL END
        WHERE office_id = $2
        RETURNING *
      `,
      [is_archived, office_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating office archive status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update office' }, { status: 500 });
  }
}
