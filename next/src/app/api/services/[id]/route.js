import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';

/**
 * PUBLIC endpoint - Get service details with linked forms
 * Used by ClientFeedbackForm to fetch form definitions for public form submission
 * No authentication required
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const serviceId = parseInt(id, 10);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Fetch service details
    const serviceQuery = `
      SELECT 
        s.service_id,
        s.service_name,
        s.description,
        s.service_type_id,
        st.service_type_name
      FROM services s
      LEFT JOIN services_types st ON s.service_type_id = st.service_type_id
      WHERE s.service_id = $1
    `;
    const serviceResult = await executeQuery(serviceQuery, [serviceId]);

    if (serviceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    const service = serviceResult.rows[0];

    // Fetch linked forms for this service
    const formsQuery = `
      SELECT 
        sf.service_id,
        sf.form_id,
        sf.form_order,
        f.form_title,
        f.status_id
      FROM service_form sf
      JOIN forms f ON sf.form_id = f.form_id
      WHERE sf.service_id = $1
      ORDER BY sf.form_order ASC
    `;
    const formsResult = await executeQuery(formsQuery, [serviceId]);


    return NextResponse.json({
      success: true,
      data: service
    });

    console.log(`[/api/services/${serviceId}] Service loaded with ${service.linked_forms.length} linked forms`);

    service.linked_forms = formsResult.rows;
    console.log(`[/api/services/${serviceId}] Service loaded with ${service.linked_forms.length} linked forms`);

    return NextResponse.json({
      success: true,
      data: service
    });
    console.log(`[GET /api/services/${serviceId}] Service "${service.service_name}" with ${service.linked_forms.length} linked form(s)`, {
      linkedForms: service.linked_forms.map(f => ({ form_id: f.form_id, form_title: f.form_title, status_id: f.status_id }))
    });

    return NextResponse.json({
      success: true,
      data: service
    });
    console.log(`[GET /api/services/${serviceId}] Service "${service.service_name}" with ${service.linked_forms.length} linked form(s)`, {
      linkedForms: service.linked_forms.map(f => ({ form_id: f.form_id, form_title: f.form_title, status_id: f.status_id }))
    });

    return NextResponse.json({
      success: true,
      data: service
    });
    service.linked_forms = formsResult.rows;

    console.log(`[GET /api/services/${serviceId}] Service "${service.service_name}" with ${service.linked_forms.length} linked form(s)`, {
      linkedForms: service.linked_forms.map(f => ({ form_id: f.form_id, form_title: f.form_title, status_id: f.status_id }))
    });

    return NextResponse.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
