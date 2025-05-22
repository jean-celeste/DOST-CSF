import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { office_id, division_id } = session.user;

  try {
    if (office_id === 1) {
      if (!division_id) {
        // No division_id, so it's the Regional Office
        return NextResponse.json({ name: 'Regional Office' });
      }
      // Get division_name
      const result = await executeQuery('SELECT division_name FROM division WHERE division_id = $1', [division_id]);
      return NextResponse.json({ name: result.rows[0]?.division_name || 'Admin' });
    } else {
      // Get office_name
      const result = await executeQuery('SELECT office_name FROM offices WHERE office_id = $1', [office_id]);
      return NextResponse.json({ name: result.rows[0]?.office_name || 'Admin' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch name' }, { status: 500 });
  }
} 