export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  adminAppUrl: import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174',
  landlordAppUrl: import.meta.env.VITE_LANDLORD_APP_URL ?? 'http://localhost:5175',
  tenantAppUrl: import.meta.env.VITE_TENANT_APP_URL ?? 'http://localhost:5176',
} as const;
