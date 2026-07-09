import { api } from '../../../lib/axios';
import type { AuthUser, LoginResponse } from '../types';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  register: (body: { fullName: string; email: string; password: string }) =>
    api<{ message: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: { email: string }) =>
    api<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: { token: string }) =>
    api<{ message: string; user: AuthUser }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
