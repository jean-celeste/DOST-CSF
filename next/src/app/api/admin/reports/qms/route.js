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

  // 1. Overall summary (existing logic)
  const overallSql = `
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
  const overallResult = await executeQuery(overallSql);

  // 2. By office
  const byOfficeSql = `
    SELECT o.office_id, o.office_name,
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
    FROM responses r
    JOIN services s ON r.service_id = s.service_id
    JOIN offices o ON s.office_id = o.office_id
    CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub
    WHERE r.form_id = 2
    GROUP BY o.office_id, o.office_name
    ORDER BY o.office_id;
  `;
  const byOfficeResult = await executeQuery(byOfficeSql);

  // 2b. By service under each office
  const byServiceSql = `
    SELECT o.office_id, o.office_name, s.service_id, s.service_name,
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
    FROM responses r
    JOIN services s ON r.service_id = s.service_id
    JOIN offices o ON s.office_id = o.office_id
    CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub
    WHERE r.form_id = 2
    GROUP BY o.office_id, o.office_name, s.service_id, s.service_name
    ORDER BY o.office_id, s.service_id;
  `;
  const byServiceResult = await executeQuery(byServiceSql);

  // Attach service breakdown to each office
  const byOfficeWithServices = byOfficeResult.rows.map(office => ({
    ...office,
    services: byServiceResult.rows.filter(s => s.office_id === office.office_id)
  }));

  // 3. By process (unit) for Regional Office only (office_id = 1)
  const byProcessSql = `
    SELECT u.unit_id, u.unit_name,
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
    FROM responses r
    JOIN services s ON r.service_id = s.service_id
    JOIN unit u ON s.unit_id = u.unit_id
    CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub
    WHERE r.form_id = 2 AND s.office_id = 1
    GROUP BY u.unit_id, u.unit_name
    ORDER BY u.unit_id;
  `;
  const byProcessResult = await executeQuery(byProcessSql);

  return NextResponse.json({ 
    success: true, 
    data: {
      overall: overallResult.rows[0],
      byOffice: byOfficeWithServices,
      byProcess: byProcessResult.rows
    }
  });
}