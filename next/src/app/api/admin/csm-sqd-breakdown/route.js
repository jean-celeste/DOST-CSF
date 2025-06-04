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
    const { role, office_id, division_id } = session.user;
    let query = `
      SELECT
        r.question_id AS sqd_id,
        COUNT(*) FILTER (WHERE r.rating = 'strongly-agree') AS strongly_agree,
        COUNT(*) FILTER (WHERE r.rating = 'agree') AS agree,
        COUNT(*) FILTER (WHERE r.rating = 'neutral') AS neutral,
        COUNT(*) FILTER (WHERE r.rating = 'disagree') AS disagree,
        COUNT(*) FILTER (WHERE r.rating = 'strongly-disagree') AS strongly_disagree,
        COUNT(*) FILTER (WHERE r.rating = 'na') AS na,
        COUNT(*) AS total_responses
      FROM csm_flat_ratings r
      JOIN responses resp ON r.response_id = resp.response_id AND resp.form_id = 1
      JOIN services s ON resp.service_id = s.service_id
    `;
    let where = 'WHERE r.question_id BETWEEN 4 AND 12';
    let values = [];
    if (role === 'Division Administrator' && division_id) {
      query += ' JOIN unit u ON s.unit_id = u.unit_id';
      where += ' AND u.division_id = $1';
      values.push(division_id);
    } else if (role === 'PSTO Administrator' && office_id) {
      where += ' AND s.office_id = $1';
      values.push(office_id);
    }
    query += ' ' + where + ' GROUP BY r.question_id ORDER BY r.question_id';
    const result = await executeQuery(query, values);
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