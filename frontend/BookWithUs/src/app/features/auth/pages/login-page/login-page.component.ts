import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthRoles } from '../../../../core/models/auth/auth-role.model';
import { LoginRequest } from '../../../../core/models/auth/login-request.model';
import { AuthService } from '../../../../core/services/auth/auth.service';

import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly themeService = inject(ThemeService);

  credentials: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false
  };

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorTitle = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly infoTitle = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);
  readonly socialNotice = signal<string | null>(null);

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'inactivity') {
      this.infoTitle.set('Session Expired');
      this.infoMessage.set('Your session expired due to inactivity. Please sign in again.');
    } else if (reason === 'session_expired') {
      this.infoTitle.set('Session Expired');
      this.infoMessage.set('Your session has expired. Please sign in again.');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSocialLogin(provider: string): void {
    this.socialNotice.set(`${provider} authentication is coming soon. Please sign in with your email.`);
    setTimeout(() => {
      this.socialNotice.set(null);
    }, 4000);
  }

  onSubmit(form: NgForm): void {
    if (this.isSubmitting()) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorTitle.set(null);
    this.errorMessage.set(null);
    this.socialNotice.set(null);

    this.authService
      .login(this.credentials)
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);

          const isAdmin =
            response.role === AuthRoles.Administrator ||
            (response.role as string) === 'Administrator' ||
            (response.email && response.email.toLowerCase() === 'adminmonkeys@gmail.com');

          if (isAdmin) {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ||
            this.route.snapshot.queryParamMap.get('redirectUrl');

          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          this.router.navigate(['/events']);
        },
        error: (error: unknown) => {
          this.isSubmitting.set(false);
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.errorTitle.set('Invalid Credentials');
        this.errorMessage.set(
          'The email or password you entered is incorrect. Please try again.'
        );
        return;
      }

      if (error.status === 403) {
        this.errorTitle.set('Access Denied');
        const message = error.error?.message;
        this.errorMessage.set(
          typeof message === 'string' && message.trim()
            ? message
            : 'Access denied. Please verify your email before signing in.'
        );
        return;
      }

      if (error.status === 0) {
        this.errorTitle.set('Connection Error');
        this.errorMessage.set(
          'Unable to reach authentication server. Please check your connection.'
        );
        return;
      }
    }

    this.errorTitle.set('Sign In Failed');
    this.errorMessage.set(
      'An unexpected error occurred during sign in. Please try again.'
    );
  }
}