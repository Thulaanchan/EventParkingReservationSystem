import { AuthRole } from './auth-role.model';

export interface LoginResponse {
  token: string;
  expiresAt: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  userId: number;
  displayName: string;
  email: string;
  role: AuthRole;
  rememberMe?: boolean;
}
