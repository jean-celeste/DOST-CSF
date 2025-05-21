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
    const query = 'SELECT client_type_id, client_type_name FROM client_type ORDER BY client_type_name';
    const result = await executeQuery(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching client types:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch client types' }, { status: 500 });
  }
} 