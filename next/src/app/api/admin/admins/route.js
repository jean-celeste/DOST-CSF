import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'Regional Administrator') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await executeQuery(`
      SELECT a.admin_id, a.username, a.role, a.office_id, a.division_id,
             o.office_name, d.division_name
      FROM admins a
      LEFT JOIN offices o ON a.office_id = o.office_id
      LEFT JOIN division d ON a.division_id = d.division_id
      ORDER BY a.username
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 });
  }
} 