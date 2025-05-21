import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const query = 'SELECT * FROM csm_sqd_positive_percentage ORDER BY question_id;';
    const result = await executeQuery(query);
    return NextResponse.json({ 
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/csm-sqd-positive:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch SQD stats',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 