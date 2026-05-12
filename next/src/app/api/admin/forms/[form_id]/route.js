import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeQuestionRow } from '@/lib/questions/questionMetadata';

// GET: Get single form with questions and linked services
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role || !session.user.role.toLowerCase().includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { role, division_id, office_id } = session.user;
    const formId = parseInt(params.form_id);

    const formQuery = `
      SELECT 
        f.form_id,
        f.form_title,
        f.description,
        f.status_id,
        fs.status_name,
        f.added_by,
        a.username as added_by_name,
        f.added_at,
        f.updated_at,
        f.version
      FROM forms f
      JOIN form_status fs ON f.status_id = fs.status_id
      LEFT JOIN admins a ON f.added_by = a.admin_id
      WHERE f.form_id = $1
    `;
    const formResult = await executeQuery(formQuery, [formId]);
    if (formResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    const form = formResult.rows[0];

    // Permission check
    if (role === 'Division Administrator' && division_id) {
      const creator = await executeQuery('SELECT division_id FROM admins WHERE admin_id = $1', [form.added_by]);
      if (creator.rows.length > 0 && creator.rows[0].division_id !== parseInt(division_id)) {
        return NextResponse.json({ success: false, error: 'Unauthorized - Can only access forms from your division' }, { status: 403 });
      }
    } else if (role === 'Office Administrator' && office_id) {
      // Check if form is linked to any service at this office
      const checkOfficeLink = await executeQuery(`
        SELECT 1 FROM service_form sf
        JOIN service_office so ON sf.service_id = so.service_id
        WHERE sf.form_id = $1 AND so.office_id = $2
        LIMIT 1
      `, [formId, office_id]);
      if (checkOfficeLink.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Unauthorized - Form not available for your office' }, { status: 403 });
      }
    }

    // Fetch questions
    const questionsResult = await executeQuery(
      'SELECT question_id, question_text, question_type, question_order FROM questions WHERE form_id = $1 ORDER BY COALESCE(question_order, question_id), question_id',
      [formId]
    );

    // Fetch linked services
    const servicesResult = await executeQuery(`
      SELECT 
        sf.service_form_id,
        sf.service_id,
        sf.form_order,
        s.service_name,
        s.description as service_description
      FROM service_form sf
      JOIN services s ON sf.service_id = s.service_id
      WHERE sf.form_id = $1
      ORDER BY sf.form_order
    `, [formId]);

    return NextResponse.json({
      success: true,
      data: {
        ...form,
        questions: questionsResult.rows.map((question) => normalizeQuestionRow(question, formId)),
        linked_services: servicesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch form' }, { status: 500 });
  }
}

// PUT: Update form metadata (creates new version)
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const body = await request.json();
    const { form_title, description, status_id } = body;

    // Verify form exists and check permissions
    const checkQuery = 'SELECT added_by, version, form_title, description FROM forms WHERE form_id = $1';
    const checkResult = await executeQuery(checkQuery, [formId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    const existingForm = checkResult.rows[0];

    if (role === 'Division Administrator') {
      const adminId = session.user.id || session.user.admin_id;
      if (existingForm.added_by !== adminId) {
        return NextResponse.json({ success: false, error: 'Unauthorized - Can only edit your own forms' }, { status: 403 });
      }
    }
    // Regional Administrator can edit any form

    // Determine values for new version
    const newVersion = existingForm.version + 1;
    const newFormTitle = form_title || existingForm.form_title;
    const newDescription = description !== undefined ? description : existingForm.description;
    const newStatusId = status_id || existingForm.status_id;
    const originalAddedBy = existingForm.added_by;

    // Archive old version
    await executeQuery('UPDATE forms SET status_id = 3 WHERE form_id = $1', [formId]);

    // Insert new version
    const insertQuery = `
      INSERT INTO forms (form_title, description, status_id, added_by, added_at, updated_at, version)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
      RETURNING *
    `;
    const values = [newFormTitle, newDescription, newStatusId, originalAddedBy, newVersion];
    const result = await executeQuery(insertQuery, values);
    const newForm = result.rows[0];
    const newFormId = newForm.form_id;

    // Copy questions to new version
    await executeQuery(`
      INSERT INTO questions (form_id, question_text, question_type, question_order)
      SELECT $1, question_text, question_type, question_order FROM questions WHERE form_id = $2
    `, [newFormId, formId]);

    // Copy service_form links to new version
    // First delete any existing links for the new form (should be none, but just in case)
    await executeQuery('DELETE FROM service_form WHERE form_id = $1', [newFormId]);
    // Copy from old version
    await executeQuery(`
      INSERT INTO service_form (service_id, form_id, form_order, created_by, created_at)
      SELECT service_id, $1, form_order, created_by, NOW() FROM service_form WHERE form_id = $2
    `, [newFormId, formId]);

    return NextResponse.json({
      success: true,
      data: newForm,
      meta: { new_form_id: newFormId, previous_form_id: formId }
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
}

// DELETE: Archive form (set status to archived)
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.id);
    const adminId = session.user.id || session.user.admin_id;

    // Verify form exists
    const checkQuery = 'SELECT added_by FROM forms WHERE form_id = $1';
    const checkResult = await executeQuery(checkQuery, [formId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator' && checkResult.rows[0].added_by !== adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Can only delete your own forms' }, { status: 403 });
    }
    // Regional Admin can delete any form

    // Archive (don't actually delete)
    await executeQuery('UPDATE forms SET status_id = 3 WHERE form_id = $1', [formId]);
    return NextResponse.json({ success: true, message: 'Form archived successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
}
