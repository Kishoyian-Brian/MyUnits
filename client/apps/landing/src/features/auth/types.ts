export type UserRole = 'ADMIN' | 'LANDLORD' | 'USER';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string | null;
  isEmailVerified: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
