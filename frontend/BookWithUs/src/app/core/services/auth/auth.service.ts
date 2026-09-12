import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRole } from '../../models/auth/auth-role.model';
import { AuthUser } from '../../models/auth/auth-user.model';
import { ForgotPasswordRequest } from '../../models/auth/forgot-password-request.model';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';
import { ResendVerificationRequest } from '../../models/auth/resend-verification-request.model';
import { ResetPasswordRequest } from '../../models/auth/reset-password-request.model';
import { VerifyEmailRequest } from '../../models/auth/verify-email-request.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(AuthSessionService);
  private readonly baseUrl = '/api/auth';

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
   * Clears active authentication session.
   */
  logout(): void {
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
