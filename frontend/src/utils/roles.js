export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

export const hasRole = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

export const canCreate = (role) => [ROLES.ADMIN, ROLES.MANAGER].includes(role);
export const canDelete = (role) => role === ROLES.ADMIN;
export const canManageOrders = (role) => [ROLES.ADMIN, ROLES.MANAGER].includes(role);
export const canViewReports = (role) => [ROLES.ADMIN, ROLES.MANAGER].includes(role);
export const canRegisterUsers = (role) => role === ROLES.ADMIN;
