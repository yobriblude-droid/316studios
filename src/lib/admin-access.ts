import type { AdminUser } from '../contexts/AdminContext';
import { hasPermission, type StaffPermission } from './roles';

export function canAccessAdminSection(
  user: AdminUser | null | undefined,
  perm: StaffPermission
): boolean {
  if (!user) return false;
  return hasPermission(user.role, user.staffPermissions || {}, perm);
}

export function isFullAdmin(user: AdminUser | null | undefined): boolean {
  return user?.role === 'admin';
}
