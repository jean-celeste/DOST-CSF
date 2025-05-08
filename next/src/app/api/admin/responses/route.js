import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

const fetchResponses = async () => {
  try {
    const query = `
      SELECT * FROM response_view;
    `;

    const result = await executeQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Database error in fetchResponses:', error);
    throw new Error('Failed to fetch responses from database');
  }
};

export async function GET() {
  try {
    const responses = await fetchResponses();
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