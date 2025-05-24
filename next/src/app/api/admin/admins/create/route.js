import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcrypt';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'Regional Administrator') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { username, password, role, office_id, division_id } = await request.json();
    const createdAt = new Date();
    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const existing = await executeQuery('SELECT username FROM admins WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await executeQuery(
        `INSERT INTO admins (username, password, role, office_id, division_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING admin_id, username, role, office_id, division_id, created_at`,
        [username, hashedPassword, role, office_id || null, division_id || null, createdAt]
      );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create admin account' }, { status: 500 });
  }
} 