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
    // For each checkmark question (1, 2, 3), get the count of each unique answer
    const queries = [1, 2, 3].map(qnum => `
      SELECT answers->'csmARTACheckmark'->>'${qnum}' AS answer, COUNT(*) AS count
      FROM responses
      WHERE form_id = 1
      GROUP BY answer
      ORDER BY count DESC
    `);

    const results = await Promise.all(queries.map(q => executeQuery(q)));

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