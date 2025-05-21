import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const query = 'SELECT office_id, office_name FROM offices ORDER BY office_name';
    const result = await executeQuery(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch offices' }, { status: 500 });
  }
} 