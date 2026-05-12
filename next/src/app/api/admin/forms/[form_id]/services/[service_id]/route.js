import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || (role !== 'Division Administrator' && role !== 'Regional Administrator')) {
    return NextResponse.json({ success: false, error: 'Unauthorized - Division Administrator or Regional Administrator only' }, { status: 401 });
  }
  try {
    const formId = parseInt(params.form_id);
    const serviceId = parseInt(params.service_id);
    const adminId = session.user.id || session.user.admin_id;

    // Verify form exists and check permissions
    const formCheck = await executeQuery('SELECT added_by FROM forms WHERE form_id = $1', [formId]);
    if (formCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    if (role === 'Division Administrator' && formCheck.rows[0].added_by !== adminId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Can only unlink your own forms' }, { status: 403 });
    }
    // Regional Admin can unlink any form

    const result = await executeQuery(
      'DELETE FROM service_form WHERE form_id = $1 AND service_id = $2 RETURNING *',
      [formId, serviceId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Form-service link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Form unlinked from service', data: result.rows[0] });
  } catch (error) {
    console.error('Error unlinking form from service:', error);
    return NextResponse.json({ success: false, error: 'Failed to unlink form from service' }, { status: 500 });
  }
}