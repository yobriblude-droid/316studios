/** Staff permission keys — admins implicitly have all. */
export const STAFF_PERMISSIONS = [
  'uploads',
  'frontend',
  'blog',
  'billing',
  'users',
  'requests',
  'communications',
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

export type StaffPermissionsMap = Partial<Record<StaffPermission, boolean>>;

export type UserRole = 'admin' | 'staff' | 'client';

export function parseStaffPermissions(raw: string | null | undefined): StaffPermissionsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as StaffPermissionsMap;
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function hasPermission(
  role: string,
  permissions: StaffPermissionsMap,
  key: StaffPermission
): boolean {
  if (role === 'admin') return true;
  if (role !== 'staff') return false;
  return Boolean(permissions[key]);
}

export const PERMISSION_LABELS: Record<StaffPermission, string> = {
  uploads: 'Media & uploads',
  frontend: 'Site content (projects, services, hero)',
  blog: 'Blog posts',
  billing: 'Billing & invoices',
  users: 'Client accounts & files',
  requests: 'Media requests queue',
  communications: 'Client messages',
};
