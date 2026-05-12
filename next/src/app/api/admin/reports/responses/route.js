import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import ExcelJS from 'exceljs';
import { decrypt } from '@/lib/cryptoUtils'; // Import the decrypt function
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Fetch all responses from the normalized tables
    const result = await executeQuery(`
      SELECT
        r.response_id,
        r.form_id,
        r.service_id,
        r.submitted_at,
        r.answers,
        c.client_id,
        c.name AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        c.sex,
        c.age,
        c.client_type_id,
        c.last_updated,
        ct.client_type_name,
        s.service_name,
        s.office_id AS unit_id,
        u.office_name AS unit_name,
        u.division_id,
        po.office_name AS office_name,
        f.form_title AS form_name,
        CASE
          WHEN r.form_id = 1 THEN 'csm'
          WHEN r.form_id = 2 THEN 'qms'
          ELSE 'unknown'
        END AS form_type
      FROM responses r
      LEFT JOIN client c ON r.client_id = c.client_id
      LEFT JOIN client_type ct ON c.client_type_id = ct.client_type_id
      LEFT JOIN services s ON r.service_id = s.service_id
      LEFT JOIN offices u ON s.office_id = u.office_id AND u.office_category = 'unit'
      LEFT JOIN forms f ON r.form_id = f.form_id
      LEFT JOIN LATERAL (
        SELECT o.office_name
        FROM service_office so
        JOIN offices o ON so.office_id = o.office_id
        WHERE so.service_id = s.service_id
          AND so.is_process_owner = true
        ORDER BY so.service_office_id
        LIMIT 1
      ) po ON true
      ORDER BY r.submitted_at DESC
    `);
    const rows = result.rows;

    // Prepare workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Responses');

    // Prepare columns (flatten answers)
    const columns = [
      { header: 'Response ID', key: 'response_id' },
      { header: 'Submitted At', key: 'submitted_at' },
      { header: 'Service Name', key: 'service_name' },
      { header: 'Office Name', key: 'office_name' },
      { header: 'Unit Name', key: 'unit_name' },
      { header: 'Client Name', key: 'client_name' },
      { header: 'Client Email', key: 'client_email' },
      { header: 'Client Phone', key: 'client_phone' },
      { header: 'Client Type', key: 'client_type_name' },
      { header: 'Form Name', key: 'form_name' },
      { header: 'Form Type', key: 'form_type' },
      // Flattened answers fields
      { header: 'General Comments', key: 'generalComments' },
      { header: 'Reason For Low Score', key: 'reasonForLowScore' },
      { header: 'Checkmark 1', key: 'checkmark_1' },
      // Ratings 4-12
      ...Array.from({ length: 9 }, (_, i) => ({
        header: `SQD ${i}`,
        key: `rating_${i + 4}`
      })),
    ];
    worksheet.columns = columns;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' } // blue background
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Set column widths
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Zebra striping and borders for all rows
    worksheet.eachRow((row, rowNumber) => {
      // Skip header for zebra
      if (rowNumber !== 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' } // light gray
        };
      }
      // Borders for all cells
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Add rows
    rows.forEach(row => {
      const answers = row.answers || {};
      const suggestion = answers.suggestion || {};
      const ratings = (answers.csmARTARatings && answers.csmARTARatings.ratings) || {};
      const checkmark = answers.csmARTACheckmark || {};

      // Decrypt sensitive fields
      const clientName = row.client_name ? decrypt(row.client_name) : 'N/A';
      const clientEmail = row.client_email ? decrypt(row.client_email) : 'N/A';
      const clientPhone = row.client_phone ? decrypt(row.client_phone) : 'N/A';

      worksheet.addRow({
        response_id: row.response_id,
        submitted_at: row.submitted_at,
        service_name: row.service_name,
        office_name: row.office_name,
        unit_name: row.unit_name,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_type_name: row.client_type_name,
        form_name: row.form_name,
        form_type: row.form_type,
        generalComments: suggestion.generalComments || '',
        reasonForLowScore: suggestion.reasonForLowScore || '',
        checkmark_1: checkmark["1"] || '',
        rating_4: ratings["4"] || '',
        rating_5: ratings["5"] || '',
        rating_6: ratings["6"] || '',
        rating_7: ratings["7"] || '',
        rating_8: ratings["8"] || '',
        rating_9: ratings["9"] || '',
        rating_10: ratings["10"] || '',
        rating_11: ratings["11"] || '',
        rating_12: ratings["12"] || '',
      });
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate timestamp for filename
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `responses_report_${timestamp}.xlsx`;

    // Return as downloadable file
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}