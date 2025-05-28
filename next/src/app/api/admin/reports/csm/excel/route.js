import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import ExcelJS from 'exceljs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { csmArtaOptions } from '@/lib/options/csm-arta-options';
import sqdLabels from '@/lib/constants/sqdLabels';

export const dynamic = 'force-dynamic';

const checkmarkQuestions = [
  {
    id: 1,
    label: "CC1. Awareness of Citizen's Charter (CC)",
    options: csmArtaOptions.ccAwareness
  },
  {
    id: 2,
    label: "CC2. Visibility of Citizen's Charter (CC)",
    options: csmArtaOptions.ccVisibility
  },
  {
    id: 3,
    label: "CC3. Helpfulness of Citizen's Charter (CC)",
    options: csmArtaOptions.ccHelpfulness
  }
];

// Helper function to style header row
const styleHeaderRow = (row) => {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // blue background
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
};

// Helper function to style cells
const styleCells = (worksheet) => {
  worksheet.eachRow((row, rowNumber) => {
    // Skip header for zebra striping, and only apply if no fill is already set
    if (!row.fill && rowNumber !== 1 && rowNumber % 2 === 0) {
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
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });
};

// Helper for service header styling
const styleServiceHeader = (row) => {
  row.font = { bold: true, size: 13 };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' } // light blue
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
};

// Helper for sheet title styling
const styleSheetTitle = (worksheet, title, colCount) => {
  worksheet.addRow([]);
  const titleRow = worksheet.addRow([title]);
  worksheet.mergeCells(titleRow.number, 1, titleRow.number, colCount);
  titleRow.font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' } };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // prominent blue
  };
  worksheet.addRow([]);
};

// Helper for footer styling
const styleFooter = (worksheet, colCount, text) => {
  const footerRow = worksheet.addRow([text]);
  worksheet.mergeCells(footerRow.number, 1, footerRow.number, colCount);
  footerRow.font = { italic: true, color: { argb: 'FF6B7280' }, size: 10 };
  footerRow.alignment = { vertical: 'middle', horizontal: 'right' };
  worksheet.addRow([]);
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // --- Fetch all required data ---
    // 1. CSM Checkmark Summary
    const summaryQueries = [1, 2, 3].map(qnum => `
      SELECT answers->'csmARTACheckmark'->>'${qnum}' AS answer, COUNT(*) AS count
      FROM responses
      WHERE form_id = 1
      GROUP BY answer
      ORDER BY count DESC
    `);
    const summaryResults = await Promise.all(summaryQueries.map(q => executeQuery(q)));

    // 2. SQD Breakdown
    const sqdBreakdownQuery = `
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
    const sqdBreakdownResult = await executeQuery(sqdBreakdownQuery);

    // 3. SQD Positive Percentages
    const sqdPositiveQuery = 'SELECT * FROM csm_sqd_positive_percentage ORDER BY question_id;';
    const sqdPositiveResult = await executeQuery(sqdPositiveQuery);

    // 4. By Service Breakdown
    const byServiceQuery = `
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
      WHERE r.question_id BETWEEN 4 AND 12
      GROUP BY s.service_id, s.service_name, o.office_id, o.office_name, r.question_id
      ORDER BY o.office_id, s.service_id, r.question_id;
    `;
    const byServiceResult = await executeQuery(byServiceQuery);

    // --- Create Excel Workbook ---
    const workbook = new ExcelJS.Workbook();

    // --- 1. Summary Sheet ---
    const summarySheet = workbook.addWorksheet('Summary');
    const summaryColCount = 3;
    styleSheetTitle(summarySheet, 'CSM Checkmark Summary', summaryColCount);
    // CSM Checkmark Summary section
    summarySheet.addRow(['Citizen\'s Charter Answers', 'Score (%)']);
    styleHeaderRow(summarySheet.lastRow);

    // Calculate scores
    const getTotal = (id) => summaryResults[id - 1].rows.reduce((acc, row) => acc + Number(row.count), 0);
    const getCount = (id, optionIndexes) => {
      return summaryResults[id - 1].rows
        .filter(row => optionIndexes.includes(
          checkmarkQuestions.find(q => q.id === id).options.indexOf(row.answer)
        ))
        .reduce((acc, row) => acc + Number(row.count), 0);
    };

    // Add summary scores
    const awarenessTotal = getTotal(1);
    const awarenessScore = awarenessTotal ? (getCount(1, [0,1,2]) / awarenessTotal) * 100 : 0;
    summarySheet.addRow(['CC Awareness', awarenessScore.toFixed(1)]);

    const visibilityTotal = getTotal(2);
    const visibilityScore = visibilityTotal ? (getCount(2, [0,1]) / visibilityTotal) * 100 : 0;
    summarySheet.addRow(['CC Visibility', visibilityScore.toFixed(1)]);

    const helpfulnessTotal = getTotal(3);
    const helpfulnessScore = helpfulnessTotal ? (getCount(3, [0,1]) / helpfulnessTotal) * 100 : 0;
    summarySheet.addRow(['CC Helpfulness', helpfulnessScore.toFixed(1)]);

    summarySheet.addRow([]); // Empty row for spacing

    // Breakdown by Checkmark Question section
    styleSheetTitle(summarySheet, 'Breakdown by Checkmark Question', summaryColCount);
    checkmarkQuestions.forEach((q, qIdx) => {
      summarySheet.addRow([]);
      summarySheet.addRow([q.label]);
      summarySheet.addRow(['Answer', 'Responses', 'Percentage']);
      styleHeaderRow(summarySheet.lastRow);

      const counts = {};
      summaryResults[qIdx].rows.forEach(row => {
        counts[row.answer] = Number(row.count);
      });
      const total = Object.values(counts).reduce((acc, val) => acc + val, 0);

      q.options.forEach((option, idx) => {
        const count = counts[option] || 0;
        const percent = total ? ((count / total) * 100).toFixed(2) : '0.00';
        summarySheet.addRow([option, count, `${percent}%`]);
      });

      summarySheet.addRow(['Total', total, total > 0 ? '100.00%' : '0.00%']);
    });

    summarySheet.columns.forEach(col => col.width = 25);
    styleCells(summarySheet);
    styleFooter(summarySheet, summaryColCount, `Exported: ${new Date().toLocaleString()}`);

    // --- 2. SQD Sheet ---
    const sqdSheet = workbook.addWorksheet('SQD');
    const sqdColCount = 9;
    styleSheetTitle(sqdSheet, 'Service Quality Dimensions (SQD)', sqdColCount);
    
    // SQD Overall section
    sqdSheet.addRow(['Service Quality Dimensions', 'SA', 'A', 'N', 'D', 'SD', 'NR', 'Total', 'Overall']);
    styleHeaderRow(sqdSheet.lastRow);

    if (sqdBreakdownResult.rows.length > 0 && sqdPositiveResult.rows.length > 0) {
      const row = sqdBreakdownResult.rows[0];
      const positiveRow = sqdPositiveResult.rows[0];
      sqdSheet.addRow([
        sqdLabels[0],
        row.strongly_agree,
        row.agree,
        row.neutral,
        row.disagree,
        row.strongly_disagree,
        row.na,
        row.total_responses,
        positiveRow ? Number(positiveRow.percentage_positive).toFixed(2) + '%' : '0.00%'
      ]);
    }

    sqdSheet.addRow([]); // Empty row for spacing

    // SQD By Dimension section
    sqdSheet.addRow(['Service Quality Dimensions', 'SA', 'A', 'N', 'D', 'SD', 'NR', 'Total', 'Overall']);
    styleHeaderRow(sqdSheet.lastRow);

    sqdBreakdownResult.rows.slice(1).forEach((row, idx) => {
      const positiveRow = sqdPositiveResult.rows.find(p => Number(p.question_id) === Number(row.sqd_id));
      sqdSheet.addRow([
        sqdLabels[idx + 1],
        row.strongly_agree,
        row.agree,
        row.neutral,
        row.disagree,
        row.strongly_disagree,
        row.na,
        row.total_responses,
        positiveRow ? Number(positiveRow.percentage_positive).toFixed(2) + '%' : '0.00%'
      ]);
    });

    // Add overall row
    const sum = (key) => sqdBreakdownResult.rows.slice(1).reduce((acc, row) => acc + Number(row[key]), 0);
    const overallPositive = sqdPositiveResult.rows.slice(1).reduce((acc, row) => acc + Number(row.positive_count), 0);
    const overallValid = sqdPositiveResult.rows.slice(1).reduce((acc, row) => acc + Number(row.valid_count), 0);
    const overallPercent = overallValid > 0 ? (overallPositive / overallValid * 100).toFixed(2) + '%' : '0.00%';

    sqdSheet.addRow([
      'Overall',
      sum('strongly_agree'),
      sum('agree'),
      sum('neutral'),
      sum('disagree'),
      sum('strongly_disagree'),
      sum('na'),
      sum('total_responses'),
      overallPercent
    ]);

    sqdSheet.columns.forEach(col => col.width = 20);
    styleCells(sqdSheet);
    styleFooter(sqdSheet, sqdColCount, `Exported: ${new Date().toLocaleString()}`);

    // --- 3. SQD by Service Sheet (blank) ---
    const sqdByServiceSheet = workbook.addWorksheet('SQD by Service');
    const sqdByServiceColCount = 9;
    styleSheetTitle(sqdByServiceSheet, 'SQD by Service (Reserved)', sqdByServiceColCount);
    sqdByServiceSheet.columns.forEach(col => col.width = 20);
    styleFooter(sqdByServiceSheet, sqdByServiceColCount, `Exported: ${new Date().toLocaleString()}`);

    // --- 4. Office Sheets ---
    // Group by office and service for office sheets
    const officeMap = {};
    byServiceResult.rows.forEach(row => {
      if (!officeMap[row.office_id]) {
        officeMap[row.office_id] = {
          office_name: row.office_name,
          services: {}
        };
      }
      if (!officeMap[row.office_id].services[row.service_id]) {
        officeMap[row.office_id].services[row.service_id] = {
          service_name: row.service_name,
          ratings: {}
        };
      }
      officeMap[row.office_id].services[row.service_id].ratings[row.question_id] = {
        strongly_agree: Number(row.strongly_agree),
        agree: Number(row.agree),
        neutral: Number(row.neutral),
        disagree: Number(row.disagree),
        strongly_disagree: Number(row.strongly_disagree),
        na: Number(row.na),
        total_responses: Number(row.total_responses)
      };
    });

    // Create a sheet for each office
    Object.entries(officeMap).forEach(([officeId, office]) => {
      const officeSheet = workbook.addWorksheet(office.office_name);
      const officeColCount = 9; // Number of columns for the data table
      styleSheetTitle(officeSheet, `${office.office_name} - CSM Ratings by Service`, officeColCount);

      // Define column properties (widths) for the entire sheet ONCE
      // The 'header' property in column definitions is less critical here as headers are added manually below.
      // Widths are the primary concern.
      officeSheet.columns = [
        { key: 'sqd', width: 30 }, // Service Quality Dimension
        { key: 'sa', width: 10 },  // Strongly Agree
        { key: 'a', width: 10 },   // Agree
        { key: 'n', width: 10 },   // Neutral
        { key: 'd', width: 10 },   // Disagree
        { key: 'sd', width: 10 },  // Strongly Disagree
        { key: 'nr', width: 10 },  // Not Rated/NA
        { key: 'total', width: 10 },// Total Responses
        { key: 'overall', width: 12 }// Overall Percentage
      ];

      const serviceList = Object.values(office.services);
      serviceList.forEach((service, sIdx) => {
        if (sIdx > 0) officeSheet.addRow([]); // Add an empty row for spacing between services

        const serviceNameRow = officeSheet.addRow([service.service_name]);
        // Merge the service name cell to span the width of the table
        officeSheet.mergeCells(serviceNameRow.number, 1, serviceNameRow.number, officeColCount);
        styleServiceHeader(serviceNameRow); // Apply styling to the row (which now contains the merged cell)

        // officeSheet.columns = [ ... ]; // REMOVED from here, as it's set once per sheet above

        officeSheet.addRow([
          'Service Quality Dimension', 'SA', 'A', 'N', 'D', 'SD', 'NR', 'Total', 'Overall'
        ]);
        styleHeaderRow(officeSheet.lastRow);
        let totalSA = 0, totalA = 0, totalN = 0, totalD = 0, totalSD = 0, totalNR = 0, totalTotal = 0;
        for (let idx = 0; idx < 8; idx++) {
          const qid = idx + 4;
          const r = service.ratings[qid] || {};
          const valid = (r.total_responses || 0) - (r.na || 0);
          const positive = (r.strongly_agree || 0) + (r.agree || 0);
          const overall = valid > 0 ? ((positive / valid) * 100).toFixed(2) + '%' : '0.00%';
          const dataRow = officeSheet.addRow([
            sqdLabels[idx + 1],
            r.strongly_agree || 0,
            r.agree || 0,
            r.neutral || 0,
            r.disagree || 0,
            r.strongly_disagree || 0,
            r.na || 0,
            r.total_responses || 0,
            overall
          ]);
          if ((idx % 2) === 1) {
            dataRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF1F5F9' }
            };
          }
          totalSA += r.strongly_agree || 0;
          totalA += r.agree || 0;
          totalN += r.neutral || 0;
          totalD += r.disagree || 0;
          totalSD += r.strongly_disagree || 0;
          totalNR += r.na || 0;
          totalTotal += r.total_responses || 0;
        }
        const valid = totalTotal - totalNR;
        const positive = totalSA + totalA;
        const totalOverall = valid > 0 ? ((positive / valid) * 100).toFixed(2) + '%' : '0.00%';
        const overallRow = officeSheet.addRow([
          'Overall',
          totalSA,
          totalA,
          totalN,
          totalD,
          totalSD,
          totalNR,
          totalTotal,
          totalOverall
        ]);
        overallRow.font = { bold: true };
        officeSheet.addRow([]);
      });
      styleCells(officeSheet);
      styleFooter(officeSheet, officeColCount, `Exported: ${new Date().toLocaleString()}`);
    });

    // --- Write to buffer and return as file ---
    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `csm_report_${timestamp}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSM Excel report:', error);
    return NextResponse.json({ error: 'Failed to generate CSM report' }, { status: 500 });
  }
}