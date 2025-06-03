import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from '@/lib/cryptoUtils';

const fetchClients = async (filter = {}) => {
  try {
    let query = `
      SELECT 
        c.client_id,
        c.name,
        c.email,
        c.phone,
        c.sex,
        c.age,
        c.client_type_id,
        c.last_updated,
        ct.client_type_name as client_type,
        COUNT(r.response_id) as response_count,
        MAX(r.submitted_at) as last_response_date
      FROM client c
      LEFT JOIN client_type ct ON c.client_type_id = ct.client_type_id
      LEFT JOIN responses r ON c.client_id = r.client_id
    `;
    
    const values = [];
    const conditions = [];
    
    // Apply role-based filtering if needed
    if ((filter.role === 'Division Head' || filter.role === 'Division Administrator') && filter.division_id) {
      query += `
        LEFT JOIN services s ON r.service_id = s.service_id
        LEFT JOIN unit u ON s.unit_id = u.unit_id
      `;
      conditions.push('u.division_id = $1 OR r.response_id IS NULL');
      values.push(filter.division_id);
    } else if (filter.role === 'PSTO Administrator' && filter.office_id) {
      query += `
        LEFT JOIN services s ON r.service_id = s.service_id
      `;
      conditions.push('s.office_id = $1 OR r.response_id IS NULL');
      values.push(filter.office_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY c.client_id, c.name, c.email, c.phone, c.sex, c.age, 
               c.client_type_id, c.last_updated, ct.client_type_name
      ORDER BY c.last_updated DESC, last_response_date DESC NULLS LAST
    `;
    
    console.log('Clients Query:', query, 'Values:', values);
    const result = await executeQuery(query, values);
    
    // Decrypt sensitive fields
    const decryptedRows = result.rows.map(row => {
      let decryptedName = row.name;
      let decryptedEmail = row.email;
      let decryptedPhone = row.phone;
      
      try {
        if (row.name) {
          const decrypted = decrypt(row.name);
          if (decrypted !== null) {
            decryptedName = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client name for client ID ${row.client_id}:`, e.message);
        decryptedName = 'Anonymous';
      }

      try {
        if (row.email) {
          const decrypted = decrypt(row.email);
          if (decrypted !== null) {
            decryptedEmail = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client email for client ID ${row.client_id}:`, e.message);
        decryptedEmail = null;
      }

      try {
        if (row.phone) {
          const decrypted = decrypt(row.phone);
          if (decrypted !== null) {
            decryptedPhone = decrypted;
          }
        }
      } catch (e) {
        console.warn(`Failed to decrypt client phone for client ID ${row.client_id}:`, e.message);
        decryptedPhone = null;
      }
  
      return {
        client_id: row.client_id,
        name: decryptedName,
        email: decryptedEmail,
        phone: decryptedPhone,
        sex: row.sex,
        age: row.age,
        client_type_id: row.client_type_id,
        client_type: row.client_type,
        last_updated: row.last_updated,
        response_count: parseInt(row.response_count) || 0,
        last_response_date: row.last_response_date
      };
    });

    return decryptedRows;
  } catch (error) {
    console.error('Database error in fetchClients:', error);
    throw new Error('Failed to fetch clients from database');
  }
};

const getClientStatistics = async (filter = {}) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN c.sex = 'male' THEN 1 END) as male_count,
        COUNT(CASE WHEN c.sex = 'female' THEN 1 END) as female_count,
        AVG(c.age) as avg_age,
        MIN(c.age) as min_age,
        MAX(c.age) as max_age,
        COUNT(CASE WHEN r.response_id IS NOT NULL THEN 1 END) as clients_with_responses,
        COUNT(DISTINCT ct.client_type_name) as client_types_count
      FROM client c
      LEFT JOIN client_type ct ON c.client_type_id = ct.client_type_id
      LEFT JOIN responses r ON c.client_id = r.client_id
    `;
    
    const values = [];
    const conditions = [];
    
    // Apply same role-based filtering
    if ((filter.role === 'Division Head' || filter.role === 'Division Administrator') && filter.division_id) {
      query += `
        LEFT JOIN services s ON r.service_id = s.service_id
        LEFT JOIN unit u ON s.unit_id = u.unit_id
      `;
      conditions.push('u.division_id = $1 OR r.response_id IS NULL');
      values.push(filter.division_id);
    } else if (filter.role === 'PSTO Administrator' && filter.office_id) {
      query += `
        LEFT JOIN services s ON r.service_id = s.service_id
      `;
      conditions.push('s.office_id = $1 OR r.response_id IS NULL');
      values.push(filter.office_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const result = await executeQuery(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in getClientStatistics:', error);
    throw new Error('Failed to fetch client statistics');
  }
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    const { role, office_id, division_id } = session.user;
    const filter = { role, office_id, division_id };
    
    const clients = await fetchClients(filter);
    
    const response = {
      success: true,
      data: clients,
      timestamp: new Date().toISOString(),
      count: clients.length
    };
    
    // Include statistics if requested
    if (includeStats) {
      const stats = await getClientStatistics(filter);
      response.statistics = stats;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch clients',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 