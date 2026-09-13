import { Injectable } from '@angular/core';
import { AuthRole } from '../../models/auth/auth-role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  currentCustomerId: number | null = 1;
  token: string | null = null;
  role: AuthRole | string | null = null;

  isAuthenticated(): boolean {
    return !!this.getToken() || this.currentCustomerId !== null;
  }

  getRole(): AuthRole | string | null {
    if (this.role) {
      return this.role;
    }

    if (typeof localStorage !== 'undefined') {
      return (
        localStorage.getItem('role') ||
        localStorage.getItem('userRole') ||
        localStorage.getItem('user_role')
      );
    }

    return null;
  }

  setRole(role: AuthRole | string | null): void {
    this.role = role;
    if (typeof localStorage !== 'undefined') {
      if (role) {
        localStorage.setItem('role', role);
      } else {
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user_role');
      }
    }
  }

  getToken(): string | null {
    if (this.token) {
      return this.token;
    }

    if (typeof localStorage !== 'undefined') {
      return (
        localStorage.getItem('token') ||
        localStorage.getItem('jwt_token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('access_token')
      );
    }

    return null;
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  setSession(token: string, customerId?: number, role?: AuthRole | string): void {
    this.token = token;
    if (customerId !== undefined) {
      this.currentCustomerId = customerId;
    }
    if (role !== undefined) {
      this.role = role;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
      if (role) {
        localStorage.setItem('role', role);
      }
    }
  }

  clearSession(): void {
    this.token = null;
    this.currentCustomerId = null;
    this.role = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user_role');
    }
  }
}
