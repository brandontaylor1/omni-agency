export const ORGANIZATION_ROLES = {
  OWNER: 'owner',
  DIRECTOR_ADMIN: 'director_admin',
  DIRECTOR: 'director',
  AGENT: 'agent',
  SUPPORT_STAFF: 'support_staff',
} as const;

export type OrganizationRole = keyof typeof ORGANIZATION_ROLES;

export const ROLE_PERMISSIONS = {
  [ORGANIZATION_ROLES.OWNER]: [
    'manage_organization',
    'manage_members',
    'manage_athletes',
    'manage_contracts',
    'view_all',
    'delete_organization',
    'invite_members',
  ],
  [ORGANIZATION_ROLES.DIRECTOR_ADMIN]: [
    'manage_members',
    'manage_athletes',
    'manage_contracts',
    'view_all',
    'invite_members',
  ],
  [ORGANIZATION_ROLES.DIRECTOR]: [
    'manage_athletes',
    'manage_contracts',
    'view_athletes',
  ],
  [ORGANIZATION_ROLES.AGENT]: [
    'view_athletes',
    'manage_contracts',
  ],
  [ORGANIZATION_ROLES.SUPPORT_STAFF]: [
    'view_limited',
  ],
} as const;

export type Permission = typeof ROLE_PERMISSIONS[OrganizationRole][number];

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role as OrganizationRole]?.includes(permission) ?? false;
}
