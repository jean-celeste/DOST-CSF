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
        s.service_id,
        s.service_name,
        o.office_id,
        o.office_name,
        r.question_id,
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
      JOIN offices o ON s.office_id = o.office_id
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
    query += ' ' + where + ' GROUP BY s.service_id, s.service_name, o.office_id, o.office_name, r.question_id ORDER BY o.office_id, s.service_id, r.question_id';
    const result = await executeQuery(query, values);
    // Group by service
    const services = {};
    result.rows.forEach(row => {
      if (!services[row.service_id]) {
        services[row.service_id] = {
          service_id: row.service_id,
          service_name: row.service_name,
          office_id: row.office_id,
          office_name: row.office_name,
          ratings: {}
        };
      }
      services[row.service_id].ratings[row.question_id] = {
        strongly_agree: Number(row.strongly_agree),
        agree: Number(row.agree),
        neutral: Number(row.neutral),
        disagree: Number(row.disagree),
        strongly_disagree: Number(row.strongly_disagree),
        na: Number(row.na),
        total_responses: Number(row.total_responses)
      };
    });
    return NextResponse.json({ 
      success: true,
      data: Object.values(services),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/reports/csm/by-service:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch CSM ratings by service',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 