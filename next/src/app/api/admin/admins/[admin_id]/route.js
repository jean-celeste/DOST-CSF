import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'Regional Administrator') {
    return false;
  }
  return true;
}

export async function GET(req, context) {
  if (!(await checkSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { admin_id } = await context.params;
  try {
    const result = await executeQuery(`
      SELECT a.admin_id, a.username, a.role, a.office_id, a.division_id,
             o.office_name, d.division_name
      FROM admins a
      LEFT JOIN offices o ON a.office_id = o.office_id
      LEFT JOIN division d ON a.division_id = d.division_id
      WHERE a.admin_id = $1
      LIMIT 1
    `, [admin_id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, context) {
  if (!(await checkSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { admin_id } = await context.params;
  const body = await req.json();

  // Convert empty string to null for integer fields
  const office_id = body.office_id === "" ? null : body.office_id;
  const division_id = body.division_id === "" ? null : body.division_id;

  try {
    await executeQuery(
      `UPDATE admins SET username = $1, office_id = $2, division_id = $3, role = $4 WHERE admin_id = $5`,
      [body.username, office_id, division_id, body.role, admin_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function DELETE(req, context) {
  if (!(await checkSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { admin_id } = await context.params;
  try {
    await executeQuery(`DELETE FROM admins WHERE admin_id = $1`, [admin_id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
} 