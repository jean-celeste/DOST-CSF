import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST: Link form to service(s) with ordering
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const adminId = session.user.id || session.user.admin_id;
    const { service_ids, services, form_order = 1 } = await request.json();

    const serviceLinks = Array.isArray(services) && services.length > 0
      ? services
      : Array.isArray(service_ids)
        ? service_ids.map((serviceId) => ({ service_id: serviceId, form_order }))
        : [];

    if (serviceLinks.length === 0) {
      return NextResponse.json({ success: false, error: 'services or service_ids array is required' }, { status: 400 });
    }

    // Verify form exists and check permissions
    const formCheck = await executeQuery('SELECT added_by FROM forms WHERE form_id = $1', [formId]);
    if (formCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator') {
      const adminId = session.user.id || session.user.admin_id;
      if (formCheck.rows[0].added_by !== adminId) {
        return NextResponse.json({ success: false, error: 'Unauthorized - Can only link your own forms' }, { status: 403 });
      }
    }
    // Regional Administrator can link any form

    // Link each service
    const results = [];
    for (const serviceLink of serviceLinks) {
      const serviceIdNum = parseInt(serviceLink.service_id);
      const serviceOrder = Number.isFinite(parseInt(serviceLink.form_order, 10))
        ? parseInt(serviceLink.form_order, 10)
        : form_order;
      // Check if service exists
      const serviceCheck = await executeQuery('SELECT service_id FROM services WHERE service_id = $1', [serviceIdNum]);
      if (serviceCheck.rows.length === 0) {
        results.push({ service_id: serviceIdNum, error: 'Service not found' });
        continue;
      }
      // Insert link (ON CONFLICT DO NOTHING to avoid duplicates)
      const linkQuery = `
        INSERT INTO service_form (service_id, form_id, form_order, created_by, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (service_id, form_id) DO UPDATE SET form_order = $3, updated_at = NOW()
        RETURNING *
      `;
      const result = await executeQuery(linkQuery, [serviceIdNum, formId, serviceOrder, adminId]);
      results.push({ service_id: serviceIdNum, success: true, data: result.rows[0] });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error linking form to services:', error);
    return NextResponse.json({ success: false, error: 'Failed to link form to services' }, { status: 500 });
  }
}
