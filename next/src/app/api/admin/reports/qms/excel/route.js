import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import ExcelJS from 'exceljs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

const qmsQuestions = [
  { key: 'overall', label: 'Over-All Satisfaction' },
  { key: 'appropriateness', label: 'Appropriateness of the service/activity' },
  { key: 'timeliness', label: 'Timeliness of delivery' },
  { key: 'attitude', label: 'Attitude of Staff' },
  { key: 'gender_fair_treatment', label: 'Gender fair treatment' },
  { key: 'beneficial', label: 'How beneficial is the service/activity' },
];

const ratingKeys = [
  'outstanding',
  'very_satisfactory',
  'satisfactory',
  'unsatisfactory',
  'poor',
];

const ratingLabels = [
  'Outstanding',
  'Very Satisfactory',
  'Satisfactory',
  'Unsatisfactory',
  'Poor',
];

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
};

const styleCells = (worksheet) => {
  worksheet.eachRow((row, rowNumber) => {
    if (!row.fill && rowNumber !== 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
      };
    }
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const isRegional = session.user.role.toLowerCase().includes('regional');
  const isDivision = session.user.role.toLowerCase().includes('division');
  const isOffice = session.user.role.toLowerCase().includes('office administrator');
  const divisionId = session.user.division_id;
  const officeId = session.user.office_id;
  const params = isDivision ? [divisionId] : isOffice ? [officeId] : [];

  try {
    let overallSql = `
      SELECT
        COUNT(*) FILTER (WHERE ratings->>'18' = 'outstanding') AS overall_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'very-satisfactory') AS overall_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'satisfactory') AS overall_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'unsatisfactory') AS overall_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'fair') AS overall_fair,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'outstanding') AS appropriateness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'very-satisfactory') AS appropriateness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'satisfactory') AS appropriateness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'unsatisfactory') AS appropriateness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'fair') AS appropriateness_fair,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'outstanding') AS timeliness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'very-satisfactory') AS timeliness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'satisfactory') AS timeliness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'unsatisfactory') AS timeliness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'fair') AS timeliness_fair,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'outstanding') AS attitude_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'very-satisfactory') AS attitude_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'satisfactory') AS attitude_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'unsatisfactory') AS attitude_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'fair') AS attitude_fair,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'outstanding') AS gender_fair_treatment_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'very-satisfactory') AS gender_fair_treatment_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'satisfactory') AS gender_fair_treatment_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'unsatisfactory') AS gender_fair_treatment_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'fair') AS gender_fair_treatment_fair,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'outstanding') AS beneficial_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'very-satisfactory') AS beneficial_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'satisfactory') AS beneficial_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'unsatisfactory') AS beneficial_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'fair') AS beneficial_fair
      FROM (
        SELECT answers->'qmsRatings'->'ratings' AS ratings
        FROM responses r
        WHERE r.form_id = 2
        ${!isRegional ? `AND EXISTS (SELECT 1 FROM services s JOIN offices o ON s.office_id = o.office_id WHERE r.service_id = s.service_id ${isDivision ? 'AND o.division_id = $1' : 'AND o.office_id = $1'})` : ''}
      ) sub;
    `;
    const overallResult = await executeQuery(overallSql, params);

    let byOfficeSql = `
      SELECT o.office_id, o.office_name,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'outstanding') AS overall_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'very-satisfactory') AS overall_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'satisfactory') AS overall_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'unsatisfactory') AS overall_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'fair') AS overall_fair,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'outstanding') AS appropriateness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'very-satisfactory') AS appropriateness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'satisfactory') AS appropriateness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'unsatisfactory') AS appropriateness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'fair') AS appropriateness_fair,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'outstanding') AS timeliness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'very-satisfactory') AS timeliness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'satisfactory') AS timeliness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'unsatisfactory') AS timeliness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'fair') AS timeliness_fair,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'outstanding') AS attitude_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'very-satisfactory') AS attitude_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'satisfactory') AS attitude_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'unsatisfactory') AS attitude_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'fair') AS attitude_fair,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'outstanding') AS gender_fair_treatment_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'very-satisfactory') AS gender_fair_treatment_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'satisfactory') AS gender_fair_treatment_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'unsatisfactory') AS gender_fair_treatment_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'fair') AS gender_fair_treatment_fair,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'outstanding') AS beneficial_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'very-satisfactory') AS beneficial_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'satisfactory') AS beneficial_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'unsatisfactory') AS beneficial_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'fair') AS beneficial_fair
      FROM responses r
      JOIN services s ON r.service_id = s.service_id
      JOIN offices o ON s.office_id = o.office_id AND o.office_category = 'unit'
      CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub
      WHERE r.form_id = 2
    `;
    if (!isRegional) byOfficeSql += isDivision ? ' AND o.division_id = $1' : ' AND o.office_id = $1';
    byOfficeSql += ' GROUP BY o.office_id, o.office_name ORDER BY o.office_id;';
    const byOfficeResult = await executeQuery(byOfficeSql, params);

    let byServiceSql = `
      SELECT o.office_id, o.office_name, s.service_id, s.service_name,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'outstanding') AS overall_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'very-satisfactory') AS overall_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'satisfactory') AS overall_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'unsatisfactory') AS overall_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'18' = 'fair') AS overall_fair,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'outstanding') AS appropriateness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'very-satisfactory') AS appropriateness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'satisfactory') AS appropriateness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'unsatisfactory') AS appropriateness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'19' = 'fair') AS appropriateness_fair,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'outstanding') AS timeliness_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'very-satisfactory') AS timeliness_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'satisfactory') AS timeliness_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'unsatisfactory') AS timeliness_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'21' = 'fair') AS timeliness_fair,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'outstanding') AS attitude_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'very-satisfactory') AS attitude_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'satisfactory') AS attitude_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'unsatisfactory') AS attitude_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'22' = 'fair') AS attitude_fair,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'outstanding') AS gender_fair_treatment_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'very-satisfactory') AS gender_fair_treatment_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'satisfactory') AS gender_fair_treatment_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'unsatisfactory') AS gender_fair_treatment_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'23' = 'fair') AS gender_fair_treatment_fair,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'outstanding') AS beneficial_outstanding,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'very-satisfactory') AS beneficial_very_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'satisfactory') AS beneficial_satisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'unsatisfactory') AS beneficial_unsatisfactory,
        COUNT(*) FILTER (WHERE ratings->>'24' = 'fair') AS beneficial_fair
      FROM responses r
      JOIN services s ON r.service_id = s.service_id
      JOIN offices o ON s.office_id = o.office_id AND o.office_category = 'unit'
      CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub
      WHERE r.form_id = 2
    `;
    if (!isRegional) byServiceSql += isDivision ? ' AND o.division_id = $1' : ' AND o.office_id = $1';
    byServiceSql += ' GROUP BY o.office_id, o.office_name, s.service_id, s.service_name ORDER BY o.office_id, s.service_id;';
    const byServiceResult = await executeQuery(byServiceSql, params);

    const byOfficeWithServices = byOfficeResult.rows.map(office => ({
      ...office,
      services: byServiceResult.rows.filter(service => service.office_id === office.office_id)
    }));

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Regionwide Summary');
    summarySheet.addRow(['Question', ...ratingLabels]);
    styleHeaderRow(summarySheet.lastRow);
    const overallRow = overallResult.rows[0] || {};
    qmsQuestions.forEach(q => {
      const row = [q.label];
      ratingKeys.forEach(rating => {
        row.push(overallRow[`${q.key}_${rating}`] || 0);
      });
      summarySheet.addRow(row);
    });
    summarySheet.columns.forEach(col => {
      col.width = 25;
    });
    styleCells(summarySheet);

    byOfficeWithServices.forEach(office => {
      const officeSheet = workbook.addWorksheet(office.office_name);
      const summaryLabelRow = officeSheet.addRow(['Office Summary']);
      officeSheet.mergeCells(summaryLabelRow.number, 1, summaryLabelRow.number, 6);
      summaryLabelRow.font = { bold: true, size: 13 };
      summaryLabelRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDBEAFE' }
      };
      summaryLabelRow.alignment = { vertical: 'middle', horizontal: 'center' };

      officeSheet.addRow(['Question', ...ratingLabels]);
      styleHeaderRow(officeSheet.lastRow);
      qmsQuestions.forEach(q => {
        const row = [q.label];
        ratingKeys.forEach(rating => {
          row.push(office[`${q.key}_${rating}`] || 0);
        });
        officeSheet.addRow(row);
      });

      officeSheet.addRow([]);
      if (office.services && office.services.length > 0) {
        office.services.forEach(service => {
          officeSheet.addRow([service.service_name]);
          officeSheet.mergeCells(officeSheet.lastRow.number, 1, officeSheet.lastRow.number, 6);
          officeSheet.lastRow.font = { bold: true, size: 13 };
          officeSheet.addRow(['Question', ...ratingLabels]);
          styleHeaderRow(officeSheet.lastRow);
          qmsQuestions.forEach(q => {
            const row = [q.label];
            ratingKeys.forEach(rating => {
              row.push(service[`${q.key}_${rating}`] || 0);
            });
            officeSheet.addRow(row);
          });
          officeSheet.addRow([]);
        });
      }

      officeSheet.columns.forEach(col => {
        col.width = 25;
      });
      styleCells(officeSheet);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `qms_report_${timestamp}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating QMS Excel report:', error);
    return NextResponse.json({ error: 'Failed to generate QMS report' }, { status: 500 });
  }
}