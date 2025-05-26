import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const query = `
      SELECT
        question_id AS sqd_id,
        COUNT(*) FILTER (WHERE rating = 'strongly-agree') AS strongly_agree,
        COUNT(*) FILTER (WHERE rating = 'agree') AS agree,
        COUNT(*) FILTER (WHERE rating = 'neutral') AS neutral,
        COUNT(*) FILTER (WHERE rating = 'disagree') AS disagree,
        COUNT(*) FILTER (WHERE rating = 'strongly-disagree') AS strongly_disagree,
        COUNT(*) FILTER (WHERE rating = 'na') AS na,
        COUNT(*) AS total_responses
      FROM csm_flat_ratings
      WHERE form_id = 1 AND question_id BETWEEN 4 AND 12
      GROUP BY question_id
      ORDER BY question_id;
    `;
    const result = await executeQuery(query);
    return NextResponse.json({ 
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/csm-sqd-breakdown:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch SQD breakdown',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 