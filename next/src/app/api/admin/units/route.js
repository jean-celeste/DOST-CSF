import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get('office_id');
    let query = 'SELECT unit_id, unit_name, office_id FROM unit';
    let values = [];
    if (officeId) {
      query += ' WHERE office_id = $1';
      values.push(officeId);
    }
    query += ' ORDER BY unit_name';
    const result = await executeQuery(query, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch units' }, { status: 500 });
  }
} 