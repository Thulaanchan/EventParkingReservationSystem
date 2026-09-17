import { AuthUser } from './auth-user.model';

export interface AuthSession {
  token: string;
  expiresAt: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  rememberMe?: boolean;
  user: AuthUser;
}
