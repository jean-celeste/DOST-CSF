import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { role, office_id, division_id } = session.user;
    const queries = [1, 2, 3].map(qnum => {
      let base = `SELECT answers->'csmARTACheckmark'->>'${qnum}' AS answer, COUNT(*) AS count FROM responses r`;
      let joins = '';
      let where = ' WHERE form_id = 1';
      let values = [];
      if (role === 'Division Administrator' && division_id) {
        joins += ' JOIN services s ON r.service_id = s.service_id JOIN unit u ON s.unit_id = u.unit_id';
        where += ' AND u.division_id = $1';
        values.push(division_id);
      } else if (role === 'PSTO Administrator' && office_id) {
        joins += ' JOIN services s ON r.service_id = s.service_id';
        where += ' AND s.office_id = $1';
        values.push(office_id);
      }
      const groupOrder = ' GROUP BY answer ORDER BY count DESC';
      return { sql: base + joins + where + groupOrder, values };
    });

    const results = await Promise.all(queries.map(q => executeQuery(q.sql, q.values)));

    // Format: { 1: [{ answer, count }, ...], 2: [...], 3: [...] }
    const summary = {};
    [1, 2, 3].forEach((qnum, idx) => {
      summary[qnum] = results[idx].rows.filter(row => row.answer !== null);
    });

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching CSM checkmark summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch CSM checkmark summary' }, { status: 500 });
  }
} 