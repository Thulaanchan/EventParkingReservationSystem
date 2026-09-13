import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  currentCustomerId: number | null = 1;
  token: string | null = null;

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

  clearSession(): void {
    this.token = null;
    this.currentCustomerId = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
    }
  }
}
