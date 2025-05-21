import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const fetchClients = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.client_id,
        c.name,
        c.email,
        c.phone,
        c.sex,
        c.age,
        c.last_updated,
        ct.client_type_name
      FROM 
        client c
      LEFT JOIN 
        client_type ct ON c.client_type_id = ct.client_type_id
      ORDER BY 
        c.last_updated DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Database error in fetchClients:', error);
    throw new Error('Failed to fetch clients from database');
  }
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const clients = await fetchClients();
    return NextResponse.json({ 
      success: true,
      data: { clients },
      timestamp: new Date().toISOString()
    });
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