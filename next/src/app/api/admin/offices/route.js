import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: List offices (with optional category filter)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let query = 'SELECT office_id, office_name, office_type_id, location, office_category, division_id, parent_office_id FROM offices';
    const values = [];

    if (category) {
      query += ' WHERE office_category = $1';
      values.push(category);
    }

    query += ' ORDER BY office_name';
    const result = await executeQuery(query, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch offices' }, { status: 500 });
  }
}

// POST: Create a new office
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || '';
  const isAdmin = ['Regional Administrator', 'Division Administrator', 'Office Administrator'].includes(role);
  if (!session || !isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { office_name, office_type_id, location, office_category } = body;

    if (!office_name || !office_type_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields: office_name, office_type_id' }, { status: 400 });
    }

    if (office_category && !['main', 'branch', 'unit'].includes(office_category)) {
      return NextResponse.json({ success: false, error: 'Invalid office_category: must be "main", "branch", or "unit"' }, { status: 400 });
    }

    const validCategory = office_category || 'main';
    const { division_id, parent_office_id } = body;

    const insertQuery = `
      INSERT INTO offices (office_name, office_type_id, location, office_category, division_id, parent_office_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await executeQuery(insertQuery, [
      office_name,
      office_type_id,
      location || null,
      validCategory,
      division_id ?? null,
      parent_office_id ?? null,
    ]);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating office:', error);
    return NextResponse.json({ success: false, error: 'Failed to create office' }, { status: 500 });
  }
}
