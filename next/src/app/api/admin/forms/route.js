import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: List forms (filtered by division for Division Admins)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { role, division_id, office_id } = session.user;
    const url = new URL(request.url);
    const mine = url.searchParams.get('mine') === 'true';
    const status = url.searchParams.get('status');

    let query = `
      SELECT
        f.form_id,
        f.form_title,
        f.description,
        f.status_id,
        fs.status_name,
        f.added_by,
        a.username as added_by_name,
        f.added_at,
        f.updated_at,
        f.version,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'service_id', sf.service_id,
              'service_name', s.service_name,
              'form_order', sf.form_order
            )
          ) FROM service_form sf
          JOIN services s ON sf.service_id = s.service_id
          WHERE sf.form_id = f.form_id),
          '[]'::json
        ) AS linked_services
      FROM forms f
      JOIN form_status fs ON f.status_id = fs.status_id
      LEFT JOIN admins a ON f.added_by = a.admin_id
    `;
    const values = [];
    const conditions = [];
    let paramIndex = 1;

    if (mine && role === 'Division Administrator') {
      conditions.push(`f.added_by = $${paramIndex}`);
      values.push(session.user.id || session.user.admin_id);
      paramIndex++;
    } else {
      if (role === 'Division Administrator' && division_id) {
        conditions.push(`f.added_by IN (SELECT admin_id FROM admins WHERE division_id = $${paramIndex})`);
        values.push(division_id);
        paramIndex++;
      } else if (role === 'Office Administrator' && office_id) {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM service_form sf
            JOIN service_office so ON sf.service_id = so.service_id
            WHERE sf.form_id = f.form_id AND so.office_id = $${paramIndex}
          )
        `);
        values.push(office_id);
        paramIndex++;
      }
    }

    if (status) {
      conditions.push(`fs.status_name = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY f.added_at DESC';
    const result = await executeQuery(query, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
}

// POST: Create a new form (Division Administrator and Regional Administrator)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { form_title, description, status_id = 2 } = body;
    if (!form_title) {
      return NextResponse.json({ success: false, error: 'Form title is required' }, { status: 400 });
    }
    const insertQuery = `
      INSERT INTO forms (form_title, description, status_id, added_by, added_at, updated_at, version)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), 1)
      RETURNING *
    `;
    const result = await executeQuery(insertQuery, [form_title, description, status_id, session.user.id || session.user.admin_id]);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
}