import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeQuestionRow, QUESTION_TYPES } from '@/lib/questions/questionMetadata';

// PUT: Update a question
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const questionId = parseInt(params.question_id);
    const adminId = session.user.id || session.user.admin_id;
    const { question_text, question_type = QUESTION_TYPES.TEXT, question_order } = await request.json();

    if (!question_text) {
      return NextResponse.json({ success: false, error: 'Question text is required' }, { status: 400 });
    }

    // Verify form exists and check permissions
    const formCheck = await executeQuery('SELECT added_by FROM forms WHERE form_id = $1', [formId]);
    if (formCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator' && formCheck.rows[0].added_by !== adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Can only edit questions in your own forms' }, { status: 403 });
    }
    // Regional Admin can edit any form's questions

    // Verify question belongs to this form
    const questionCheck = await executeQuery(
      'SELECT question_id FROM questions WHERE question_id = $1 AND form_id = $2',
      [questionId, formId]
    );
    if (questionCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    const result = await executeQuery(
      'UPDATE questions SET question_text = $1, question_type = $2, question_order = COALESCE($3, question_order) WHERE question_id = $4 RETURNING *',
      [question_text, question_type, question_order ?? null, questionId]
    );
    return NextResponse.json({ success: true, data: normalizeQuestionRow(result.rows[0], formId) });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE: Remove a question
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const questionId = parseInt(params.question_id);
    const adminId = session.user.id || session.user.admin_id;

    // Verify form exists and check permissions
    const formCheck = await executeQuery('SELECT added_by FROM forms WHERE form_id = $1', [formId]);
    if (formCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator' && formCheck.rows[0].added_by !== adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Can only delete questions from your own forms' }, { status: 403 });
    }
    // Regional Admin can delete questions from any form

    await executeQuery('DELETE FROM questions WHERE question_id = $1 AND form_id = $2', [questionId, formId]);
    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 });
  }
}
