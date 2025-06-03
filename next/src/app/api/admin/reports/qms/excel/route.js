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

// Helper to style header row
const styleHeaderRow = (row) => {
  row.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
};

// Helper to style cells
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
  // Role-based filtering
  const isRegional = session.user.role.toLowerCase().includes('regional');
  const isDivision = session.user.role.toLowerCase().includes('division');
  const isPSTO = session.user.role.toLowerCase().includes('psto');
  const divisionId = session.user.division_id;
  const officeId = session.user.office_id;
  const params = isDivision ? [divisionId] : isPSTO ? [officeId] : [];

  try {
    // --- Fetch QMS data (same as /api/admin/reports/qms) ---
    // 1. Overall summary
    let overallSql = `SELECT ... FROM (SELECT answers->'qmsRatings'->'ratings' AS ratings, r.service_id FROM responses r WHERE r.form_id = 2`;
    if (!isRegional) overallSql += ` AND EXISTS (SELECT 1 FROM services s JOIN offices o ON s.office_id = o.office_id WHERE r.service_id = s.service_id` + (isDivision ? ' AND o.division_id = $1' : ' AND o.office_id = $1') + ')';
    overallSql += ') sub;';
    const overallResult = await executeQuery(overallSql, params);

    // 2. By office
    let byOfficeSql = `SELECT o.office_id, o.office_name, ... FROM responses r JOIN services s ON r.service_id = s.service_id JOIN offices o ON s.office_id = o.office_id CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub WHERE r.form_id = 2`;
    if (!isRegional) byOfficeSql += isDivision ? ' AND o.division_id = $1' : ' AND o.office_id = $1';
    byOfficeSql += ' GROUP BY o.office_id, o.office_name ORDER BY o.office_id;';
    const byOfficeResult = await executeQuery(byOfficeSql, params);

    // 2b. By service under each office
    let byServiceSql = `SELECT o.office_id, o.office_name, s.service_id, s.service_name, ... FROM responses r JOIN services s ON r.service_id = s.service_id JOIN offices o ON s.office_id = o.office_id CROSS JOIN LATERAL (SELECT r.answers->'qmsRatings'->'ratings' AS ratings) AS sub WHERE r.form_id = 2`;
    if (!isRegional) byServiceSql += isDivision ? ' AND o.division_id = $1' : ' AND o.office_id = $1';
    byServiceSql += ' GROUP BY o.office_id, o.office_name, s.service_id, s.service_name ORDER BY o.office_id, s.service_id;';
    const byServiceResult = await executeQuery(byServiceSql, params);

    // Attach service breakdown to each office
    const byOfficeWithServices = byOfficeResult.rows.map(office => ({
      ...office,
      services: byServiceResult.rows.filter(s => s.office_id === office.office_id)
    }));

    // --- Create Excel Workbook ---
    const workbook = new ExcelJS.Workbook();

    // --- 1. Regionwide Summary Sheet ---
    const summarySheet = workbook.addWorksheet('Regionwide Summary');
    summarySheet.addRow(['Question', ...ratingLabels]);
    styleHeaderRow(summarySheet.lastRow);
    qmsQuestions.forEach(q => {
      const row = [q.label];
      ratingKeys.forEach(rating => {
        row.push(overallResult.rows[0][`${q.key}_${rating}`] || 0);
      });
      summarySheet.addRow(row);
    });
    summarySheet.columns.forEach(col => col.width = 25);
    styleCells(summarySheet);

    // --- 2. Per-Office Sheets ---
    byOfficeWithServices.forEach(office => {
      const officeSheet = workbook.addWorksheet(office.office_name);
      // Add label for summary table
      const summaryLabelRow = officeSheet.addRow(['Office Summary']);
      officeSheet.mergeCells(summaryLabelRow.number, 1, summaryLabelRow.number, 6);
      summaryLabelRow.font = { bold: true, size: 13 };
      summaryLabelRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDBEAFE' } // light blue
      };
      summaryLabelRow.alignment = { vertical: 'middle', horizontal: 'center' };
      // Office summary table
      officeSheet.addRow(['Question', ...ratingLabels]);
      styleHeaderRow(officeSheet.lastRow);
      qmsQuestions.forEach(q => {
        const row = [q.label];
        ratingKeys.forEach(rating => {
          row.push(office[`${q.key}_${rating}`] || 0);
        });
        officeSheet.addRow(row);
      });
      officeSheet.addRow([]); // Spacer
      // Per-service tables
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
          officeSheet.addRow([]); // Spacer
        });
      }
      officeSheet.columns.forEach(col => col.width = 25);
      styleCells(officeSheet);
    });

    // --- Write to buffer and return as file ---
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