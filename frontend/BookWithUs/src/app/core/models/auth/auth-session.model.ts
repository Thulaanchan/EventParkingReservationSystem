import { AuthUser } from './auth-user.model';

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}
