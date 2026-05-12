import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from '@/lib/cryptoUtils';

const fetchResponses = async (filter = {}) => {
  try {
    let query = `
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
    `;
    const values = [];
    const conditions = [];
    if ((filter.role === 'Division Head' || filter.role === 'Division Administrator') && filter.division_id) {
      conditions.push('u.division_id = $1');
      values.push(filter.division_id);
     } else if (filter.role === 'Office Administrator' && filter.office_id) {
      conditions.push(`EXISTS (SELECT 1 FROM service_office so WHERE so.service_id = s.service_id AND so.office_id = $1)`);
      values.push(filter.office_id);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY r.submitted_at DESC;';
    console.log('Query:', query, 'Values:', values);
    const result = await executeQuery(query, values);
    
    // Decrypt sensitive fields
    const decryptedRows = result.rows.map(row => {
      let decryptedName = row.client_name;
      let decryptedEmail = row.client_email;
      let decryptedPhone = row.client_phone; 
      
      try {
        if (row.client_name) {
          const decrypted = decrypt(row.client_name);
          if (decrypted !== null) { // Check if decryption was successful
            decryptedName = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client_name for response ID ${row.response_id}:`, e.message);
        // Keep original encrypted value or set to a placeholder if preferred
      }

      try {
        if (row.client_email) {
          const decrypted = decrypt(row.client_email);
          if (decrypted !== null) { // Check if decryption was successful
            decryptedEmail = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client_email for response ID ${row.response_id}:`, e.message);
        // Keep original encrypted value or set to a placeholder if preferred
      }

      try {
        if (row.client_phone) {
          const decrypted = decrypt(row.client_phone);
          if (decrypted !== null) {
            decryptedPhone = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client_phone for response ID ${row.response_id}:`, e.message);
      }
  
      return {
        ...row,
        client_name: decryptedName,
        client_email: decryptedEmail,
        client_phone: decryptedPhone,
      };
    });

    return decryptedRows;
  } catch (error) {
    console.error('Database error in fetchResponses:', error);
    throw new Error('Failed to fetch responses from database');
  }
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { role, office_id, division_id } = session.user;
    let filter = { role, office_id, division_id };
    const responses = await fetchResponses(filter);
    return NextResponse.json({ 
      success: true,
      data: responses,  // Return the array directly
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/responses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch responses',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}