import { AuthRole } from './auth-role.model';

export interface AuthUser {
  userId: number;
  customerId: number;
  displayName: string;
  email: string;
  role: AuthRole;
}
