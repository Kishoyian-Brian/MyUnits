import { env } from '../../../lib/env';
import type { UserRole } from '../types';

export function postAuthRedirect(role: UserRole) {
  const map: Record<UserRole, string> = {
    ADMIN: env.adminAppUrl,
    LANDLORD: env.landlordAppUrl,
    USER: env.tenantAppUrl,
  };
  window.location.href = map[role] ?? env.landlordAppUrl;
}
