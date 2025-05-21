import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from '@/lib/cryptoUtils';

const fetchResponses = async (filter = {}) => {
  try {
    let query = `
      SELECT r.*, s.office_id, s.unit_id, u.division_id
      FROM response_details_view r
      LEFT JOIN services s ON r.service_id = s.service_id
      LEFT JOIN unit u ON s.unit_id = u.unit_id
    `;
    const values = [];
    const conditions = [];
    if (filter.role === 'Division Head' && filter.division_id) {
      conditions.push('u.division_id = $1');
      values.push(filter.division_id);
    } else if (filter.role === 'PSTO Administrator' && filter.office_id) {
      conditions.push('s.office_id = $1');
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
  if (!session || !session.user.role) {
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