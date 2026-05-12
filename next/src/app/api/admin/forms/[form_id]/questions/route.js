import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeQuestionRow, QUESTION_TYPES } from '@/lib/questions/questionMetadata';

// GET: List all questions for a form
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || !role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    
    // Verify form exists and user has access (Division Admin can only access their own forms)
    const formCheck = await executeQuery('SELECT added_by FROM forms WHERE form_id = $1', [formId]);
    if (formCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    const form = formCheck.rows[0];
    
    if (session.user.role === 'Division Administrator') {
      const adminCheck = await executeQuery('SELECT division_id FROM admins WHERE admin_id = $1', [session.user.id || session.user.admin_id]);
      if (adminCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
      const creatorCheck = await executeQuery('SELECT division_id FROM admins WHERE admin_id = $1', [form.added_by]);
      if (creatorCheck.rows.length === 0 || creatorCheck.rows[0].division_id !== adminCheck.rows[0].division_id) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    const result = await executeQuery(
      'SELECT question_id, question_text, question_type, question_order FROM questions WHERE form_id = $1 ORDER BY COALESCE(question_order, question_id), question_id',
      [formId]
    );
    return NextResponse.json({ success: true, data: result.rows.map((question) => normalizeQuestionRow(question, formId)) });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST: Add a question to a form
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const adminId = session.user.id || session.user.admin_id;
    const { question_text, question_type = QUESTION_TYPES.TEXT, question_order } = await request.json();

    if (!question_text) {
      return NextResponse.json({ success: false, error: 'Question text is required' }, { status: 400 });
    }

    // Verify form exists and check permissions
    const checkQuery = 'SELECT added_by FROM forms WHERE form_id = $1';
    const checkResult = await executeQuery(checkQuery, [formId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator') {
      const adminId = session.user.id || session.user.admin_id;
      if (checkResult.rows[0].added_by !== adminId) {
        return NextResponse.json({ success: false, error: 'Unauthorized - Can only add questions to your own forms' }, { status: 403 });
      }
    }
    // Regional Administrator can add questions to any form

    const nextOrderResult = await executeQuery('SELECT COALESCE(MAX(question_order), MAX(question_id), 0) + 1 AS next_order FROM questions WHERE form_id = $1', [formId]);
    const resolvedOrder = Number.isFinite(parseInt(question_order, 10))
      ? parseInt(question_order, 10)
      : parseInt(nextOrderResult.rows[0]?.next_order || 1, 10);

    const insertQuery = 'INSERT INTO questions (form_id, question_text, question_type, question_order) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await executeQuery(insertQuery, [formId, question_text, question_type, resolvedOrder]);
    return NextResponse.json({ success: true, data: normalizeQuestionRow(result.rows[0], formId) });
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json({ success: false, error: 'Failed to add question' }, { status: 500 });
  }
}
