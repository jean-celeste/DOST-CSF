import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { normalizeQuestionRow } from '@/lib/questions/questionMetadata';

/**
 * PUBLIC endpoint - Get form details with questions
 * Used by ClientFeedbackForm to fetch form definitions for public form submission
 * No authentication required
 */
export async function GET(request, { params }) {
  try {
    const formId = parseInt(params.id, 10);

    if (isNaN(formId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    // Fetch form details
    const formQuery = `
      SELECT 
        f.form_id,
        f.form_title,
        f.description,
        f.status_id,
        fs.status_name
      FROM forms f
      JOIN form_status fs ON f.status_id = fs.status_id
      WHERE f.form_id = $1
    `;
    const formResult = await executeQuery(formQuery, [formId]);

    if (formResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    const form = formResult.rows[0];

    // Fetch questions for this form
    const questionsQuery = `
      SELECT 
        question_id,
        question_text,
        question_type,
        question_order
      FROM questions
      WHERE form_id = $1
      ORDER BY COALESCE(question_order, question_id), question_id
    `;
    const questionsResult = await executeQuery(questionsQuery, [formId]);

    // Fetch linked services
    const servicesQuery = `
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
    `;
    const servicesResult = await executeQuery(servicesQuery, [formId]);

    const responseData = {
      success: true,
      data: {
        form_id: form.form_id,
        form_title: form.form_title,
        description: form.description,
        status_id: form.status_id,
        status_name: form.status_name,
        questions: questionsResult.rows.map((question) =>
          normalizeQuestionRow(question, formId)
        ),
        linked_services: servicesResult.rows
      }
    };
    
    console.log(`[/api/forms/${formId}] Returning form with ${responseData.data.questions.length} questions, status_id=${responseData.data.status_id}`);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
