import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Debug: Log received credentials
    console.log('Received login request:', {
      username,
      password
    });

    // Query the database to check admin credentials
    const result = await executeQuery(
      'SELECT * FROM admins WHERE username = $1 AND password = $2',
      [username, password]
    );

    // Debug: Log query result
    console.log('Database query result:', {
      rowCount: result.rows.length,
      foundAdmin: result.rows.length > 0
    });

    if (result.rows.length > 0) {
      // Admin found - return success with admin data (excluding password)
      const admin = result.rows[0];
      const { password: _, ...adminWithoutPassword } = admin;
      
      return NextResponse.json({
        success: true,
        admin: adminWithoutPassword
      });
    } else {
      // No admin found with these credentials
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 