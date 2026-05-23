import { UserRole } from '../../generated/prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtPayloadUser {
  userId: string;
  email: string;
  role: UserRole;
}
