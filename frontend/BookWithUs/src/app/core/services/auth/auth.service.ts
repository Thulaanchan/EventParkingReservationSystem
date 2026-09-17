import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRole } from '../../models/auth/auth-role.model';
import { AuthUser } from '../../models/auth/auth-user.model';
import { ForgotPasswordRequest } from '../../models/auth/forgot-password-request.model';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';
import { ResendVerificationRequest } from '../../models/auth/resend-verification-request.model';
import { RegisterRequest } from '../../models/auth/register-request.model';
import { ResetPasswordRequest } from '../../models/auth/reset-password-request.model';
import { VerifyEmailRequest } from '../../models/auth/verify-email-request.model';
import { Customer } from '../../models/customers/customer.model';
import { AuthSessionService } from './auth-session.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(AuthSessionService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Signals (Single source of truth delegated from AuthSessionService)
  readonly session = this.sessionService.session;
  readonly currentUser = this.sessionService.currentUser;
  readonly token = this.sessionService.token;
  readonly isAuthenticated = this.sessionService.isAuthenticated;
  readonly isCustomer = this.sessionService.isCustomer;
  readonly isAdmin = this.sessionService.isAdmin;

  // Observables (Delegated from AuthSessionService)
  readonly session$ = this.sessionService.session$;
  readonly currentUser$ = this.sessionService.currentUser$;
  readonly token$ = this.sessionService.token$;
  readonly isAuthenticated$ = this.sessionService.isAuthenticated$;
  readonly isCustomer$ = this.sessionService.isCustomer$;
  readonly isAdmin$ = this.sessionService.isAdmin$;

  /**
   * Authenticates user with credentials and updates session state on success.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap((response) => this.sessionService.setSession(response))
      );
  }

  /**
   * Registers a new customer account.
   * Backend endpoint: POST /api/customers/register
   */
  register(request: RegisterRequest): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiUrl}/customers/register`, request);
  }

  /**
   * Verifies customer email address with verification token.
   */
  verifyEmail(request: VerifyEmailRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/verify-email`,
      request
    );
  }

  /**
   * Requests a new email verification link.
   */
  resendVerification(
    request: ResendVerificationRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/resend-verification`,
      request
    );
  }

  /**
   * Initiates password recovery process.
   */
  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/forgot-password`,
      request
    );
  }

  /**
   * Completes password reset with reset token and new password.
   */
  resetPassword(
    request: ResetPasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/reset-password`,
      request
    );
  }

  /**
   * Refreshes active JWT access token using rotated refresh token.
   */
  refreshToken(): Observable<LoginResponse> {
    const currentRefreshToken = this.sessionService.getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken: currentRefreshToken })
      .pipe(
        tap((response) => {
          this.sessionService.updateTokens(
            response.token,
            response.expiresAt,
            response.refreshToken,
            response.refreshTokenExpiresAt
          );
        })
      );
  }

  /**
   * Clears active authentication session and revokes server-side refresh token.
   */
  logout(callApi = true): void {
    const currentRefreshToken = this.sessionService.getRefreshToken();
    if (callApi && currentRefreshToken) {
      this.http
        .post<{ message: string }>(`${this.baseUrl}/logout`, { refreshToken: currentRefreshToken })
        .subscribe({
          next: () => {},
          error: () => {} // Non-blocking revocation
        });
    }
    this.sessionService.clearSession();
  }

  /**
   * Returns current JWT token or null.
   */
  getToken(): string | null {
    return this.sessionService.getToken();
  }

  /**
   * Returns current authenticated user or null.
   */
  getCurrentUser(): AuthUser | null {
    return this.sessionService.getCurrentUser();
  }

  /**
   * Checks whether the current authenticated user has a specific role.
   */
  hasRole(role: AuthRole): boolean {
    return this.sessionService.hasRole(role);
  }
}
