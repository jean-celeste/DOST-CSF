import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const ROLES = {
  REGIONAL_ADMIN: 'Regional Administrator',
  DIVISION_ADMIN: 'Division Administrator',
  OFFICE_ADMIN: 'Office Administrator',
};

export const ACTIONS = {
  CREATE_FORM: 'create_form',
  EDIT_FORM: 'edit_form',
  DELETE_FORM: 'delete_form',
  LINK_FORM_TO_SERVICE: 'link_form_to_service',
  VIEW_ALL_FORMS: 'view_all_forms',
  VIEW_MY_FORMS: 'view_my_forms',
  MANAGE_SERVICE_OFFICE: 'manage_service_office',
  CREATE_ADMIN: 'create_admin',
  VIEW_RESPONSES: 'view_responses',
};

const PERMISSION_MATRIX = {
  [ROLES.REGIONAL_ADMIN]: [
    ACTIONS.CREATE_FORM,
    ACTIONS.EDIT_FORM,
    ACTIONS.DELETE_FORM,
    ACTIONS.LINK_FORM_TO_SERVICE,
    ACTIONS.VIEW_ALL_FORMS,
    ACTIONS.VIEW_MY_FORMS,
    ACTIONS.MANAGE_SERVICE_OFFICE,
    ACTIONS.CREATE_ADMIN,
    ACTIONS.VIEW_RESPONSES,
  ],
  [ROLES.DIVISION_ADMIN]: [
    ACTIONS.CREATE_FORM,
    ACTIONS.EDIT_FORM,
    ACTIONS.DELETE_FORM,
    ACTIONS.LINK_FORM_TO_SERVICE,
    ACTIONS.VIEW_MY_FORMS,
    ACTIONS.MANAGE_SERVICE_OFFICE,
  ],
  [ROLES.OFFICE_ADMIN]: [],
};

export function hasPermission(role, action) {
  const allowedActions = PERMISSION_MATRIX[role] || [];
  return allowedActions.includes(action);
}

export function canAccessResource(session, resourceOwnerId) {
  if (!session || !session.user) return false;
  const { role, id, admin_id, office_id, division_id } = session.user;
  
  if (role === ROLES.REGIONAL_ADMIN) return true;
  if (role === ROLES.OFFICE_ADMIN) {
    return resourceOwnerId === office_id;
  }
  if (role === ROLES.DIVISION_ADMIN) {
    return resourceOwnerId === division_id;
  }
  return false;
}

export async function requirePermission(action) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.role) {
    return { authorized: false, session: null, error: 'Unauthorized' };
  }
  
  if (!hasPermission(session.user.role, action)) {
    return { authorized: false, session, error: 'Insufficient permissions' };
  }
  
  return { authorized: true, session };
}

export function isAdmin(role) {
  return role && role.toLowerCase().includes('admin');
}