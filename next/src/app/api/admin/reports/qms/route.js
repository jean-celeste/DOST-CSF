import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const sql = `
    SELECT 
      COUNT(*) FILTER (WHERE ratings->>'18' = 'outstanding') AS overall_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'18' = 'very-satisfactory') AS overall_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'18' = 'satisfactory') AS overall_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'18' = 'unsatisfactory') AS overall_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'18' = 'poor') AS overall_poor,

      COUNT(*) FILTER (WHERE ratings->>'19' = 'outstanding') AS appropriateness_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'19' = 'very-satisfactory') AS appropriateness_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'19' = 'satisfactory') AS appropriateness_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'19' = 'unsatisfactory') AS appropriateness_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'19' = 'poor') AS appropriateness_poor,

      COUNT(*) FILTER (WHERE ratings->>'21' = 'outstanding') AS timeliness_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'21' = 'very-satisfactory') AS timeliness_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'21' = 'satisfactory') AS timeliness_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'21' = 'unsatisfactory') AS timeliness_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'21' = 'poor') AS timeliness_poor,

      COUNT(*) FILTER (WHERE ratings->>'22' = 'outstanding') AS attitude_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'22' = 'very-satisfactory') AS attitude_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'22' = 'satisfactory') AS attitude_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'22' = 'unsatisfactory') AS attitude_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'22' = 'poor') AS attitude_poor,

      COUNT(*) FILTER (WHERE ratings->>'23' = 'outstanding') AS gender_fair_treatment_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'23' = 'very-satisfactory') AS gender_fair_treatment_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'23' = 'satisfactory') AS gender_fair_treatment_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'23' = 'unsatisfactory') AS gender_fair_treatment_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'23' = 'poor') AS gender_fair_treatment_poor,

      COUNT(*) FILTER (WHERE ratings->>'24' = 'outstanding') AS beneficial_outstanding,
      COUNT(*) FILTER (WHERE ratings->>'24' = 'very-satisfactory') AS beneficial_very_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'24' = 'satisfactory') AS beneficial_satisfactory,
      COUNT(*) FILTER (WHERE ratings->>'24' = 'unsatisfactory') AS beneficial_unsatisfactory,
      COUNT(*) FILTER (WHERE ratings->>'24' = 'poor') AS beneficial_poor
    FROM (
      SELECT answers->'qmsRatings'->'ratings' AS ratings
      FROM responses
      WHERE form_id = 2
    ) sub;
  `;
  const result = await executeQuery(sql);
  return NextResponse.json({ success: true, data: result.rows[0] });
} 